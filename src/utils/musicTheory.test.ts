import { chords } from '../data/chords'
import { getChord } from './chordUtils'
import { fretToMidi, getChordSoundingNotes, midiToNoteName } from './musicTheory'

describe('music theory', () => {
  it.each([
    [0, 0, 'E2'], [0, 1, 'F2'], [1, 3, 'C3'], [2, 2, 'E3'],
  ])('calculates string %i fret %i as %s', (stringIndex, fret, expected) => {
    expect(midiToNoteName(fretToMidi(stringIndex, fret))).toBe(expected)
  })

  it('calculates the sounding notes for C major and skips its muted string', () => {
    const notes = getChordSoundingNotes(getChord(chords, 'C', 'major'))
    expect(notes.map((note) => note.name)).toEqual(['C3', 'E3', 'G3', 'C4', 'E4'])
    expect(notes).toHaveLength(5)
  })

  it('calculates all six strings for E minor', () => {
    const notes = getChordSoundingNotes(getChord(chords, 'E', 'minor'))
    expect(notes.map((note) => note.name)).toEqual(['E2', 'B2', 'E3', 'G3', 'B3', 'E4'])
  })
})
