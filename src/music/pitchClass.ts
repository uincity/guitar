import type { AccidentalPreference, NoteName, PitchClass } from '../types/music'

export const NOTE_TO_PITCH_CLASS: Record<NoteName, PitchClass> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

export const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const
export const SHARP_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export const normalizePitchClass = (value: number) => ((value % 12) + 12) % 12 as PitchClass
export const noteNameToPitchClass = (name: NoteName) => NOTE_TO_PITCH_CLASS[name]

export const pitchClassToNoteName = (pitchClass: PitchClass, preference: AccidentalPreference = 'auto') =>
  (preference === 'sharp' ? SHARP_NOTE_NAMES : FLAT_NOTE_NAMES)[pitchClass]

export const getRootOptions = (preference: AccidentalPreference) =>
  (preference === 'sharp' ? SHARP_NOTE_NAMES : FLAT_NOTE_NAMES).map((name, pitchClass) => ({ name, pitchClass: pitchClass as PitchClass }))
