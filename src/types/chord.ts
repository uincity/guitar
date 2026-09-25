export const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export type NoteName = (typeof ROOT_NOTES)[number]

export const CHORD_TYPES = ['major', 'minor', '7', 'maj7', 'm7'] as const
export type ChordType = (typeof CHORD_TYPES)[number]

export interface Barre {
  fret: number
  fromString: number
  toString: number
  finger: number
}

export interface GuitarChord {
  id: string
  root: NoteName
  type: ChordType
  symbol: string
  name: string
  frets: number[]
  fingers: number[]
  barre?: Barre | null
}

export interface SoundingNote {
  stringNumber: number
  fret: number
  midi: number
  name: string
  frequency: number
}
