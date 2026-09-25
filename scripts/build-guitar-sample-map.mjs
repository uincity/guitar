import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sampleRoot = path.join(projectRoot, 'src', 'audio', 'nylon-guitar')
const outputPath = path.join(sampleRoot, 'sample-map.generated.json')

const normalizeSamplePath = (value) => {
  const parts = value.replaceAll('\\', '/').split('/')
  const normalized = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') normalized.pop()
    else normalized.push(part)
  }
  return normalized.join('/')
}

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(absolute) : [absolute]
  }))
  return nested.flat()
}

const parseOpcodes = (source) => Object.fromEntries(
  [...source.matchAll(/([a-zA-Z_][\w]*)=([^\s]+)/g)].map((match) => [match[1], match[2]]),
)

const numberValue = (value, fallback) => value === undefined ? fallback : Number(value)

const parseSfz = (text, sourceSfz) => {
  const regions = []
  let global = {}
  let group = {}
  let section = null
  let currentRegion = null

  const commitRegion = () => {
    if (!currentRegion) return
    const opcodes = { ...global, ...group, ...currentRegion }
    if (!opcodes.sample) throw new Error(`${sourceSfz}: region is missing sample`)
    const key = numberValue(opcodes.key, undefined)
    const rootMidi = numberValue(opcodes.pitch_keycenter, key)
    if (!Number.isFinite(rootMidi)) throw new Error(`${sourceSfz}: region is missing key/pitch_keycenter`)
    regions.push({
      fileKey: normalizeSamplePath(opcodes.sample),
      rootMidi,
      lowMidi: numberValue(opcodes.lokey, key ?? rootMidi),
      highMidi: numberValue(opcodes.hikey, key ?? rootMidi),
      velocityMin: numberValue(opcodes.lovel, 1),
      velocityMax: numberValue(opcodes.hivel, 127),
      volumeDb: numberValue(opcodes.volume, 0),
      tuneCents: numberValue(opcodes.tune, 0),
      offset: numberValue(opcodes.offset, 0),
      attackSeconds: numberValue(opcodes.ampeg_attack, 0),
      decaySeconds: numberValue(opcodes.ampeg_decay, 0),
      sustainPercent: numberValue(opcodes.ampeg_sustain, 100),
      releaseSeconds: numberValue(opcodes.ampeg_release, 0),
      sourceSfz,
    })
    currentRegion = null
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\/\/.*$/, '').trim()
    if (!line) continue
    const sections = [...line.matchAll(/<(global|group|region)>/g)]
    if (sections.length) {
      for (const match of sections) {
        if (match[1] === 'region') commitRegion()
        section = match[1]
        if (section === 'group') group = {}
        if (section === 'region') currentRegion = {}
      }
    }
    const opcodes = parseOpcodes(line.replace(/<(global|group|region)>/g, ''))
    if (section === 'global') global = { ...global, ...opcodes }
    else if (section === 'group') group = { ...group, ...opcodes }
    else if (section === 'region' && currentRegion) currentRegion = { ...currentRegion, ...opcodes }
  }
  commitRegion()
  return regions
}

const allFiles = await listFiles(sampleRoot)
const wavFiles = allFiles.filter((file) => path.extname(file).toLowerCase() === '.wav')
const sfzFiles = allFiles.filter((file) => path.extname(file).toLowerCase() === '.sfz')
if (!sfzFiles.length) throw new Error('No SFZ file found')

const actualWavPaths = new Map(wavFiles.map((file) => {
  const relative = normalizeSamplePath(path.relative(sampleRoot, file))
  return [relative.toLowerCase(), relative]
}))

const regions = []
for (const sfzFile of sfzFiles) {
  const relativeSfz = normalizeSamplePath(path.relative(sampleRoot, sfzFile))
  const parsed = parseSfz(await readFile(sfzFile, 'utf8'), relativeSfz)
  for (const region of parsed) {
    const actual = actualWavPaths.get(region.fileKey.toLowerCase())
    if (!actual) throw new Error(`${relativeSfz}: missing WAV reference ${region.fileKey}`)
    if (actual !== region.fileKey) throw new Error(`${relativeSfz}: case mismatch: SFZ=${region.fileKey}, disk=${actual}`)
    regions.push(region)
  }
}

const referenced = new Set(regions.map((region) => region.fileKey.toLowerCase()))
const regionSignatures = new Set()
for (const region of regions) {
  if (region.lowMidi > region.highMidi) throw new Error(`${region.sourceSfz}: invalid key range for ${region.fileKey}`)
  if (region.velocityMin > region.velocityMax) throw new Error(`${region.sourceSfz}: invalid velocity range for ${region.fileKey}`)
  const signature = [region.lowMidi, region.highMidi, region.velocityMin, region.velocityMax].join(':')
  if (regionSignatures.has(signature)) throw new Error(`${region.sourceSfz}: duplicate ambiguous mapping ${signature}`)
  regionSignatures.add(signature)
}
const unreferenced = wavFiles
  .map((file) => normalizeSamplePath(path.relative(sampleRoot, file)))
  .filter((file) => !referenced.has(file.toLowerCase()))
if (unreferenced.length) throw new Error(`Unreferenced WAV files: ${unreferenced.join(', ')}`)

regions.sort((a, b) => a.lowMidi - b.lowMidi || a.velocityMin - b.velocityMin || a.rootMidi - b.rootMidi)
await writeFile(outputPath, `${JSON.stringify(regions, null, 2)}\n`, 'utf8')
console.log(`Generated ${path.relative(projectRoot, outputPath)} with ${regions.length} SFZ regions and ${referenced.size} WAV assets.`)
