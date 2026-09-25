import { MOVABLE_CHORD_SHAPES } from '../data/chordShapes'
import { generateChordVoicings, transposeShape, validateChordShape } from './voicingGenerator'
import { OPEN_CHORDS } from '../data/openChords'

const shape = (id: string) => MOVABLE_CHORD_SHAPES.find((candidate) => candidate.id === id)!

describe('movable chord shapes', () => {
  it('validates all reusable and open shapes', () => {
    ;[...OPEN_CHORDS, ...MOVABLE_CHORD_SHAPES].forEach((item) => expect(validateChordShape(item)).toBe(true))
  })

  it.each([
    [5, [1, 3, 3, 2, 1, 1]],
    [6, [2, 4, 4, 3, 2, 2]],
    [8, [4, 6, 6, 5, 4, 4]],
  ] as const)('transposes E major to pitch class %i', (root, expected) => {
    expect(transposeShape(shape('e-major'), root).frets).toEqual(expected)
  })

  it.each([
    [10, [-1, 1, 3, 3, 3, 1]],
    [0, [-1, 3, 5, 5, 5, 3]],
    [1, [-1, 4, 6, 6, 6, 4]],
  ] as const)('transposes A major without moving muted strings', (root, expected) => {
    expect(transposeShape(shape('a-major'), root).frets).toEqual(expected)
  })

  it('generates a barre automatically and dynamically positions the fret window', () => {
    const result = transposeShape(shape('e-minor'), 7)
    expect(result.frets).toEqual([3, 5, 5, 3, 3, 3])
    expect(result.barre).toEqual({ fret: 3, fromString: 6, toString: 1, finger: 1 })
    expect(result.startFret).toBe(3)
  })

  it('prefers Open C and the low A Shape for Bb', () => {
    expect(generateChordVoicings(0, 'major')[0].shapeId).toBe('open-c')
    expect(generateChordVoicings(10, 'major')[0].shapeId).toBe('a-major')
  })

  it('generates both E and A shape voicings for all 60 root-quality combinations', () => {
    const qualities = ['major', 'minor', '7', 'maj7', 'm7'] as const
    const combinations = Array.from({ length: 12 }, (_, root) =>
      qualities.map((quality) => generateChordVoicings(root as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11, quality)),
    ).flat()
    expect(combinations).toHaveLength(60)
    combinations.forEach((voicings) => expect(voicings.length).toBeGreaterThanOrEqual(2))
  })
})
