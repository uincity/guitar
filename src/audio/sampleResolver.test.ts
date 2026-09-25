import { getSoundingNotesFromFrets } from '../utils/midi'
import { nylonGuitarAssets } from './nylonGuitarAssetRegistry'
import {
  findExactSample,
  findNearestSample,
  findRangeSample,
  getPlaybackRate,
  guitarSampleManifest,
  normalizeSamplePath,
  resolveGuitarSample,
  selectVelocityLayer,
  type GuitarSampleDefinition,
} from './sampleResolver'
import { toBuildSamplePath } from './samplePath'

const sample = (overrides: Partial<GuitarSampleDefinition> = {}): GuitarSampleDefinition => ({
  fileKey: 'samples/C4.wav',
  rootMidi: 60,
  lowMidi: 60,
  highMidi: 60,
  velocityMin: 1,
  velocityMax: 127,
  volumeDb: 0,
  tuneCents: 0,
  offset: 0,
  attackSeconds: 0,
  decaySeconds: 0,
  sustainPercent: 100,
  releaseSeconds: 1.5,
  sourceSfz: 'test.sfz',
  ...overrides,
})

describe('nylon guitar sample resolver', () => {
  it('normalizes Windows, dot and parent path segments', () => {
    expect(normalizeSamplePath('.\\folder\\..\\samples//C4.wav')).toBe('samples/C4.wav')
    expect(toBuildSamplePath('samples/C#4.wav')).toBe('samples/C-sharp-4.wav')
  })

  it('selects an exact sample at its original pitch', () => {
    const exact = findExactSample([sample()], 60)
    expect(exact?.rootMidi).toBe(60)
    expect(getPlaybackRate(60, exact!.rootMidi)).toBe(1)
  })

  it('calculates upward and downward semitone playback rates', () => {
    expect(getPlaybackRate(61, 60)).toBeCloseTo(2 ** (1 / 12))
    expect(getPlaybackRate(59, 60)).toBeCloseTo(2 ** (-1 / 12))
  })

  it('uses an SFZ key range before a nearest-root heuristic', () => {
    const ranged = sample({ rootMidi: 60, lowMidi: 59, highMidi: 61 })
    expect(findRangeSample([ranged], 59)).toBe(ranged)
    expect(findNearestSample([sample()], 63)?.rootMidi).toBe(60)
    expect(findNearestSample([sample()], 64)).toBeUndefined()
  })

  it('selects the matching velocity layer', () => {
    const quiet = sample({ fileKey: 'quiet.wav', velocityMin: 1, velocityMax: 63 })
    const loud = sample({ fileKey: 'loud.wav', velocityMin: 64, velocityMax: 127 })
    expect(selectVelocityLayer([quiet, loud], 0.25)).toBe(quiet)
    expect(selectVelocityLayer([quiet, loud], 0.75)).toBe(loud)
  })

  it('returns null when neither a region nor an asset URL can be resolved', () => {
    expect(resolveGuitarSample({ midi: 100 }, [sample()], new Map([['samples/C4.wav', '/C4.wav']]))).toBeNull()
    expect(resolveGuitarSample({ midi: 60 }, [sample()], new Map())).toBeNull()
  })

  it('resolves every generated SFZ region to a Vite-served asset URL', () => {
    expect(guitarSampleManifest).toHaveLength(48)
    guitarSampleManifest.forEach(({ fileKey }) => expect(nylonGuitarAssets.get(fileKey)).toBeTruthy())
    expect(nylonGuitarAssets.get('samples/C#2.wav')).toContain('C%232.wav')
  })

  it.each([
    ['Open C', [-1, 3, 2, 0, 1, 0], [48, 52, 55, 60, 64]],
    ['CAGED C E shape', [8, 10, 10, 9, 8, 8], [48, 55, 60, 64, 67, 72]],
  ] as const)('resolves every sounding MIDI note in %s', (_label, frets, midiNotes) => {
    const soundingNotes = getSoundingNotesFromFrets([...frets])
    expect(soundingNotes.map(({ midi }) => midi)).toEqual(midiNotes)
    soundingNotes.forEach((note) => {
      const resolved = resolveGuitarSample({
        midi: note.midi,
        string: note.stringNumber,
        fret: note.fret,
      })
      expect(resolved).not.toBeNull()
      expect(resolved?.string).toBe(note.stringNumber)
      expect(resolved?.fret).toBe(note.fret)
    })
  })
})
