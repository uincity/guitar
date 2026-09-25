import { CAGED_SHAPE_ORDER } from '../types/caged'
import { generateCagedPositions, validateCagedShape } from './cagedGenerator'
import { normalizePitchClass } from './pitchClass'

describe('CAGED position generator', () => {
  const cMajor = generateCagedPositions(0, 'major', { min: 0, max: 15 }, 'flat')

  it('generates all five CAGED templates instead of root-specific stored chords', () => {
    expect(cMajor.map((position) => position.shape)).toEqual(CAGED_SHAPE_ORDER)
  })

  it.each([
    ['C', [-1, 3, 2, 0, 1, 0]],
    ['A', [-1, 3, 5, 5, 5, 3]],
    ['G', [8, 7, 5, 5, 5, 8]],
    ['E', [8, 10, 10, 9, 8, 8]],
    ['D', [-1, -1, 10, 12, 13, 12]],
  ] as const)('generates the C Major %s Shape', (shape, frets) => {
    expect(cMajor.find((position) => position.shape === shape)?.theoryFrets).toEqual(frets)
  })

  it('contains only C, E and G and validates every full and partial voicing', () => {
    cMajor.forEach((position) => {
      expect(validateCagedShape(position)).toBe(true)
      position.theoryNotes.forEach((note) => expect([0, 4, 7]).toContain(normalizePitchClass(note.midi)))
    })
  })

  it('generates five valid positions for every chromatic root', () => {
    for (let root = 0; root < 12; root += 1) {
      const positions = generateCagedPositions(root as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11)
      expect(positions).toHaveLength(5)
      positions.forEach((position) => expect(validateCagedShape(position)).toBe(true))
    }
  })

  it('computes sounding MIDI from each generated fret', () => {
    const aShape = cMajor.find((position) => position.shape === 'A')!
    expect(aShape.theoryNotes.map((note) => note.midi)).toEqual([48, 55, 60, 64, 67])
  })
})
