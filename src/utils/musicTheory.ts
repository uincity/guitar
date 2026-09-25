import type { GuitarChord, SoundingNote } from '../types/chord'

export const CHROMATIC_NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const
export const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64] as const

export const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const midiToNoteName = (midi: number) => {
  const note = CHROMATIC_NOTES[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${note}${octave}`
}

export const fretToMidi = (stringIndex: number, fret: number, capo = 0) => {
  if (stringIndex < 0 || stringIndex > 5) throw new Error('String index must be between 0 and 5')
  if (fret < 0) throw new Error('Muted strings do not have a MIDI note')
  return OPEN_STRING_MIDI[stringIndex] + fret + capo
}

export const getChordSoundingNotes = (chord: GuitarChord, capo = 0): SoundingNote[] =>
  chord.frets.flatMap((fret, stringIndex) => {
    if (fret < 0) return []
    const midi = fretToMidi(stringIndex, fret, capo)
    return [{
      stringNumber: 6 - stringIndex,
      fret,
      midi,
      name: midiToNoteName(midi),
      frequency: midiToFrequency(midi),
    }]
  })
