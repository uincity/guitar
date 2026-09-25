import { generateChord } from '../music/chordGenerator'
import { fretToMidi, getSoundingNotes, midiToNoteName } from './midi'

describe('MIDI and sounding notes', () => {
  it.each([[0, 0, 'E2'], [0, 1, 'F2'], [1, 3, 'C3']] as const)('calculates string %i fret %i as %s', (stringIndex, fret, expected) => {
    expect(midiToNoteName(fretToMidi(stringIndex, fret))).toBe(expected)
  })

  it('calculates C Open sounding notes', () => {
    expect(getSoundingNotes(generateChord(0, 'major', 'flat')[0], 'flat').map((note) => note.name))
      .toEqual(['C3', 'E3', 'G3', 'C4', 'E4'])
  })

  it('calculates Bb A Shape sounding notes', () => {
    expect(getSoundingNotes(generateChord(10, 'major', 'flat')[0], 'flat').map((note) => note.name))
      .toEqual(['Bb2', 'F3', 'Bb3', 'D4', 'F4'])
  })
})
