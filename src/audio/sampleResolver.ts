import manifest from './nylon-guitar/sample-map.generated.json'
import { nylonGuitarAssets } from './nylonGuitarAssetRegistry'
import { normalizeSamplePath } from './samplePath'

export interface GuitarSampleDefinition {
  fileKey: string
  rootMidi: number
  lowMidi: number
  highMidi: number
  velocityMin: number
  velocityMax: number
  volumeDb: number
  tuneCents: number
  offset: number
  attackSeconds: number
  decaySeconds: number
  sustainPercent: number
  releaseSeconds: number
  sourceSfz: string
}

export interface GuitarSampleRequest {
  midi: number
  velocity?: number
  string?: number
  fret?: number
}

export interface ResolvedGuitarSample extends GuitarSampleDefinition {
  url: string
  targetMidi: number
  playbackRate: number
  velocityMidi: number
  velocityLayer: [number, number]
  sourceFile: string
  string?: number
  fret?: number
}

export const guitarSampleManifest = manifest as GuitarSampleDefinition[]

const toMidiVelocity = (velocity = 0.9) => Math.max(1, Math.min(127, Math.round(velocity * 127)))
const supportsVelocity = (sample: GuitarSampleDefinition, velocity: number) => velocity >= sample.velocityMin && velocity <= sample.velocityMax

export const selectVelocityLayer = (samples: GuitarSampleDefinition[], velocity: number) => {
  const velocityMidi = toMidiVelocity(velocity)
  return samples
    .filter((sample) => supportsVelocity(sample, velocityMidi))
    .sort((a, b) => (a.velocityMax - a.velocityMin) - (b.velocityMax - b.velocityMin))[0]
}

export const findExactSample = (samples: GuitarSampleDefinition[], midi: number, velocity = 0.9) =>
  selectVelocityLayer(samples.filter((sample) => sample.rootMidi === midi), velocity)

export const findRangeSample = (samples: GuitarSampleDefinition[], midi: number, velocity = 0.9) =>
  selectVelocityLayer(samples.filter((sample) => midi >= sample.lowMidi && midi <= sample.highMidi), velocity)

export const findNearestSample = (samples: GuitarSampleDefinition[], midi: number, velocity = 0.9, maxSemitones = 3) => {
  const velocityMidi = toMidiVelocity(velocity)
  return samples
    .filter((sample) => supportsVelocity(sample, velocityMidi) && Math.abs(sample.rootMidi - midi) <= maxSemitones)
    .sort((a, b) => Math.abs(a.rootMidi - midi) - Math.abs(b.rootMidi - midi))[0]
}

export const getPlaybackRate = (targetMidi: number, rootMidi: number, tuneCents = 0) =>
  2 ** ((targetMidi - rootMidi - tuneCents / 100) / 12)

export const resolveGuitarSample = (
  request: GuitarSampleRequest,
  samples: GuitarSampleDefinition[] = guitarSampleManifest,
  assets: ReadonlyMap<string, string> = nylonGuitarAssets,
): ResolvedGuitarSample | null => {
  const velocity = request.velocity ?? 0.9
  const sample = findExactSample(samples, request.midi, velocity)
    ?? findRangeSample(samples, request.midi, velocity)
    ?? findNearestSample(samples, request.midi, velocity)
  if (!sample) return null
  const fileKey = normalizeSamplePath(sample.fileKey)
  const url = assets.get(fileKey)
  if (!url) return null
  const velocityMidi = toMidiVelocity(velocity)
  return {
    ...sample,
    fileKey,
    url,
    targetMidi: request.midi,
    playbackRate: getPlaybackRate(request.midi, sample.rootMidi, sample.tuneCents),
    velocityMidi,
    velocityLayer: [sample.velocityMin, sample.velocityMax],
    sourceFile: fileKey,
    string: request.string,
    fret: request.fret,
  }
}

export { normalizeSamplePath }
