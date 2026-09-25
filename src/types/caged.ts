import type { Barre, ChordQuality } from './chord'
import type { PitchClass, SoundingNote } from './music'

export const CAGED_SHAPE_ORDER = ['C', 'A', 'G', 'E', 'D'] as const
export type CagedShapeName = (typeof CAGED_SHAPE_ORDER)[number]
export type CagedDisplayMode = 'note' | 'interval'
export type CagedLearningLayer = 'root' | 'chord-tones' | 'shape'
export type CagedVoicingMode = 'theory' | 'playable'
export type CagedFretboardMode = 'position' | 'full'
export type CagedOrderMode = 'fret' | 'caged'
export type Difficulty = 'Easy' | 'Medium' | 'Advanced'

export interface CagedShapeTemplate {
  id: string
  shape: CagedShapeName
  baseRoot: PitchClass
  quality: ChordQuality
  frets: number[]
  fingers: number[]
  rootStrings: number[]
  movable: true
  description: string
}

export interface PartialVoicingTemplate {
  id: string
  parentShape: CagedShapeName
  strings: number[]
  label: string
  difficulty: Difficulty
}

export interface CagedRootPosition {
  stringNumber: number
  fret: number
  midi: number
}

export interface CagedPosition {
  id: string
  shape: CagedShapeName
  baseRoot: PitchClass
  root: PitchClass
  quality: 'major'
  offset: number
  theoryFrets: number[]
  theoryFingers: number[]
  playableFrets: number[]
  playableFingers: number[]
  theoryBarre: Barre | null
  playableBarre: Barre | null
  startFret: number
  endFret: number
  rootPositions: CagedRootPosition[]
  theoryNotes: SoundingNote[]
  playableNotes: SoundingNote[]
  theoryDifficulty: Difficulty
  playableDifficulty: Difficulty
  playableLabel: string
  description: string
}

export interface FretboardTone extends SoundingNote {
  pitchClass: PitchClass
  interval: string
  isRoot: boolean
}

export interface FretRange {
  min: number
  max: number
}
