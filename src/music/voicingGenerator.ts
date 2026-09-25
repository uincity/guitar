import { MOVABLE_CHORD_SHAPES } from '../data/chordShapes'
import { OPEN_CHORDS } from '../data/openChords'
import type { Barre, ChordQuality, ChordShape, GuitarVoicing } from '../types/chord'
import type { PitchClass } from '../types/music'
import { normalizePitchClass } from './pitchClass'
import { scoreVoicing } from './voicingScore'

export interface TransposedShape {
  frets: number[]
  fingers: number[]
  barre: Barre | null
  startFret: number
  displayFrets: number
  offset: number
}

export const validateChordShape = (shape: ChordShape) => {
  if (shape.frets.length !== 6) throw new Error(`${shape.id}: frets must contain 6 values`)
  if (shape.fingers.length !== 6) throw new Error(`${shape.id}: fingers must contain 6 values`)
  if (shape.frets.some((fret) => !Number.isInteger(fret) || fret < -1)) throw new Error(`${shape.id}: invalid fret`)
  if (shape.fingers.some((finger) => !Number.isInteger(finger) || finger < 0 || finger > 4)) throw new Error(`${shape.id}: invalid finger`)
  return true
}

;[...OPEN_CHORDS, ...MOVABLE_CHORD_SHAPES].forEach(validateChordShape)

export const transposeShape = (shape: ChordShape, targetRoot: PitchClass): TransposedShape => {
  if (!shape.movable && targetRoot !== shape.baseRoot) throw new Error(`${shape.id} is not movable`)
  const offset = shape.movable ? normalizePitchClass(targetRoot - shape.baseRoot) : 0
  const frets = shape.frets.map((fret) => fret < 0 ? -1 : fret + offset)
  const fingers = shape.fingers.map((finger, index) => offset > 0 && shape.frets[index] === 0 ? 1 : finger)
  const positiveFrets = frets.filter((fret) => fret > 0)
  const minFret = positiveFrets.length ? Math.min(...positiveFrets) : 1
  const startFret = minFret <= 1 ? 1 : minFret
  const barre = offset > 0
    ? { fret: offset, fromString: shape.rootString, toString: 1, finger: 1 }
    : shape.barre ?? null
  return { frets, fingers, barre, startFret, displayFrets: 5, offset }
}

export const generateChordVoicings = (root: PitchClass, quality: ChordQuality): GuitarVoicing[] => {
  const shapes = [
    ...OPEN_CHORDS.filter((shape) => shape.baseRoot === root && shape.quality === quality),
    ...MOVABLE_CHORD_SHAPES.filter((shape) => shape.quality === quality),
  ]
  return shapes.map((shape) => {
    const transposed = transposeShape(shape, root)
    return {
      id: `${root}-${quality}-${shape.id}`,
      root,
      quality,
      displayRoot: '',
      symbol: '',
      name: '',
      shapeId: shape.id,
      shapeName: shape.name,
      family: shape.family,
      ...transposed,
      score: scoreVoicing(shape, transposed.frets),
    }
  }).sort((a, b) => a.score - b.score)
}

export const getPreferredVoicing = (voicings: GuitarVoicing[]) => {
  if (!voicings.length) throw new Error('No playable voicing was generated')
  return [...voicings].sort((a, b) => a.score - b.score)[0]
}
