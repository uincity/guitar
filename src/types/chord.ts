import type { PitchClass } from './music'

export const CHORD_QUALITIES = ['major', 'minor', '7', 'maj7', 'm7'] as const
export type ChordQuality = (typeof CHORD_QUALITIES)[number]
export type ShapeFamily = 'open' | 'e-shape' | 'a-shape' | 'other'

export interface Barre {
  fret: number
  fromString: number
  toString: number
  finger: number
}

export interface ChordShape {
  id: string
  name: string
  family: ShapeFamily
  quality: ChordQuality
  baseRoot: PitchClass
  frets: number[]
  fingers: number[]
  movable: boolean
  rootString: number
  barre?: Barre | null
  commonness?: number
}

export interface GuitarVoicing {
  id: string
  root: PitchClass
  quality: ChordQuality
  displayRoot: string
  symbol: string
  name: string
  shapeId: string
  shapeName: string
  family: ShapeFamily
  frets: number[]
  fingers: number[]
  barre: Barre | null
  startFret: number
  displayFrets: number
  score: number
}
