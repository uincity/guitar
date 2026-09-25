export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type AccidentalPreference = 'auto' | 'flat' | 'sharp'

export type NoteName =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F'
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

export interface SoundingNote {
  stringNumber: number
  fret: number
  midi: number
  name: string
  frequency: number
}
