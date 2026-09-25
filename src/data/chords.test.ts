import { chords } from './chords'
import { validateChord } from '../utils/chordUtils'

describe('chord data', () => {
  it('contains and validates all 35 required chords', () => {
    expect(chords).toHaveLength(35)
    chords.forEach((chord) => expect(validateChord(chord)).toBe(true))
  })
})
