import { STANDARD_TUNING } from '../data/tuning'
import type { GuitarVoicing } from '../types/chord'
import type { AccidentalPreference, SoundingNote } from '../types/music'
import { normalizePitchClass, pitchClassToNoteName } from '../music/pitchClass'

export const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const midiToNoteName = (midi: number, preference: AccidentalPreference = 'auto') => {
  const note = pitchClassToNoteName(normalizePitchClass(midi), preference)
  return `${note}${Math.floor(midi / 12) - 1}`
}

export const fretToMidi = (stringIndex: number, fret: number, capo = 0) => {
  if (stringIndex < 0 || stringIndex > 5) throw new Error('String index must be between 0 and 5')
  if (fret < 0) throw new Error('Muted strings do not have a MIDI note')
  return STANDARD_TUNING[stringIndex] + fret + capo
}

export const getSoundingNotes = (voicing: GuitarVoicing, preference: AccidentalPreference = 'auto', capo = 0): SoundingNote[] =>
  voicing.frets.flatMap((fret, stringIndex) => {
    if (fret < 0) return []
    const midi = fretToMidi(stringIndex, fret, capo)
    return [{ stringNumber: 6 - stringIndex, fret, midi, name: midiToNoteName(midi, preference), frequency: midiToFrequency(midi) }]
  })
