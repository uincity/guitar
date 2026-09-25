import { CAGED_PARTIAL_VOICINGS } from '../data/cagedPartialVoicings'
import { CAGED_SHAPES } from '../data/cagedShapes'
import { getChordPitchClasses } from './intervalMapper'
import { getCagedShapePosition, sortCagedPositionsByFret } from './cagedPosition'
import type { Barre } from '../types/chord'
import type { CagedPosition, CagedShapeName, CagedShapeTemplate, Difficulty, FretRange, PartialVoicingTemplate } from '../types/caged'
import type { AccidentalPreference, PitchClass, SoundingNote } from '../types/music'
import { normalizePitchClass } from './pitchClass'
import { fretToMidi, getSoundingNotesFromFrets } from '../utils/midi'

export interface TransposedCagedShape {
  offset: number
  frets: number[]
  fingers: number[]
  barre: Barre | null
}

const makeBarre = (template: CagedShapeTemplate, frets: number[], offset: number): Barre | null => {
  if (offset <= 0) return null
  const zeroStrings = template.frets.flatMap((fret, index) => fret === 0 && frets[index] >= 0 ? [6 - index] : [])
  if (zeroStrings.length < 2) return null
  return { fret: offset, fromString: Math.max(...zeroStrings), toString: Math.min(...zeroStrings), finger: 1 }
}

const findOffsetInRange = (template: CagedShapeTemplate, targetRoot: PitchClass, range: FretRange) => {
  const baseOffset = normalizePitchClass(targetRoot - template.baseRoot)
  const candidates = [baseOffset - 12, baseOffset, baseOffset + 12]
  return candidates.find((offset) => {
    const frets = template.frets.filter((fret) => fret >= 0).map((fret) => fret + offset)
    return frets.every((fret) => fret >= range.min && fret <= range.max)
  }) ?? baseOffset
}

export const transposeCagedShape = (
  template: CagedShapeTemplate,
  targetRoot: PitchClass,
  fretRange: FretRange = { min: 0, max: 15 },
): TransposedCagedShape => {
  const offset = findOffsetInRange(template, targetRoot, fretRange)
  const frets = template.frets.map((fret) => fret < 0 ? -1 : fret + offset)
  if (frets.some((fret) => fret < -1)) throw new Error(`${template.id}: generated a negative fret`)
  const fingers = template.fingers.map((finger, index) => offset > 0 && template.frets[index] === 0 ? 1 : finger)
  return { offset, frets, fingers, barre: makeBarre(template, frets, offset) }
}

export const generatePartialVoicing = (
  template: CagedShapeTemplate,
  transposed: TransposedCagedShape,
  partial?: PartialVoicingTemplate,
) => {
  if (!partial) return { frets: transposed.frets, fingers: transposed.fingers, barre: transposed.barre, label: '전체 Shape' }
  const frets = transposed.frets.map((fret, index) => partial.strings.includes(6 - index) ? fret : -1)
  const fingers = transposed.fingers.map((finger, index) => partial.strings.includes(6 - index) ? finger : 0)
  return { frets, fingers, barre: makeBarre(template, frets, transposed.offset), label: partial.label }
}

export const getCagedRootPositions = (template: CagedShapeTemplate, frets: number[], root: PitchClass) =>
  template.rootStrings.map((stringNumber) => {
    const stringIndex = 6 - stringNumber
    const fret = frets[stringIndex]
    const midi = fretToMidi(stringIndex, fret)
    if (normalizePitchClass(midi) !== root) throw new Error(`${template.id}: invalid relative root position`)
    return { stringNumber, fret, midi }
  })

const difficultyFor = (shape: CagedShapeName, offset: number): Difficulty => {
  if (offset === 0) return 'Easy'
  if (shape === 'A' || shape === 'E') return 'Medium'
  return 'Advanced'
}

export const validateCagedShape = (position: CagedPosition) => {
  const chordPitches = new Set(getChordPitchClasses(position.root, position.quality))
  const validateNotes = (notes: SoundingNote[], label: string) => {
    const pitches = new Set(notes.map((note) => normalizePitchClass(note.midi)))
    if ([...pitches].some((pitch) => !chordPitches.has(pitch))) throw new Error(`${position.id}: ${label} contains a non-chord tone`)
    if (!pitches.has(position.root)) throw new Error(`${position.id}: ${label} has no root`)
    if ([...chordPitches].some((pitch) => !pitches.has(pitch))) throw new Error(`${position.id}: ${label} is missing a chord tone`)
  }
  validateNotes(position.theoryNotes, 'theory shape')
  validateNotes(position.playableNotes, 'playable voicing')
  return true
}

export const generateCagedPositions = (
  root: PitchClass,
  quality: 'major' = 'major',
  fretRange: FretRange = { min: 0, max: 15 },
  preference: AccidentalPreference = 'auto',
) => {
  const positions = CAGED_SHAPES.map((template): CagedPosition => {
    const transposed = transposeCagedShape(template, root, fretRange)
    const partial = CAGED_PARTIAL_VOICINGS.find((candidate) => candidate.parentShape === template.shape)
    const playable = generatePartialVoicing(template, transposed, partial)
    const theoryNotes = getSoundingNotesFromFrets(transposed.frets, preference)
    const playableNotes = getSoundingNotesFromFrets(playable.frets, preference)
    const { startFret, endFret } = getCagedShapePosition(transposed.frets)
    return {
      id: `${root}-${quality}-${template.shape}`,
      shape: template.shape,
      baseRoot: template.baseRoot,
      root,
      quality,
      offset: transposed.offset,
      theoryFrets: transposed.frets,
      theoryFingers: transposed.fingers,
      playableFrets: playable.frets,
      playableFingers: playable.fingers,
      theoryBarre: transposed.barre,
      playableBarre: playable.barre,
      startFret,
      endFret,
      rootPositions: getCagedRootPositions(template, transposed.frets, root),
      theoryNotes,
      playableNotes,
      theoryDifficulty: difficultyFor(template.shape, transposed.offset),
      playableDifficulty: partial?.difficulty ?? difficultyFor(template.shape, transposed.offset),
      playableLabel: playable.label,
      description: template.description,
    }
  })
  positions.forEach(validateCagedShape)
  return positions
}

export { sortCagedPositionsByFret }
