import type { ChordType, GuitarChord, NoteName } from '../types/chord'

const TONES: Record<NoteName, { majorThird: string; minorThird: string; fifth: string; minorSeventh: string; majorSeventh: string }> = {
  C: { majorThird: 'E', minorThird: 'E♭', fifth: 'G', minorSeventh: 'B♭', majorSeventh: 'B' },
  D: { majorThird: 'F♯', minorThird: 'F', fifth: 'A', minorSeventh: 'C', majorSeventh: 'C♯' },
  E: { majorThird: 'G♯', minorThird: 'G', fifth: 'B', minorSeventh: 'D', majorSeventh: 'D♯' },
  F: { majorThird: 'A', minorThird: 'A♭', fifth: 'C', minorSeventh: 'E♭', majorSeventh: 'E' },
  G: { majorThird: 'B', minorThird: 'B♭', fifth: 'D', minorSeventh: 'F', majorSeventh: 'F♯' },
  A: { majorThird: 'C♯', minorThird: 'C', fifth: 'E', minorSeventh: 'G', majorSeventh: 'G♯' },
  B: { majorThird: 'D♯', minorThird: 'D', fifth: 'F♯', minorSeventh: 'A', majorSeventh: 'A♯' },
}

export const getChordTones = (root: NoteName, type: ChordType) => {
  const tone = TONES[root]
  const third = type === 'minor' || type === 'm7' ? tone.minorThird : tone.majorThird
  const seventh = type === '7' || type === 'm7' ? tone.minorSeventh : type === 'maj7' ? tone.majorSeventh : null
  return [root, third, tone.fifth, ...(seventh ? [seventh] : [])]
}

export const validateChord = (chord: GuitarChord) => {
  if (chord.frets.length !== 6) throw new Error(`${chord.id}: frets must contain 6 values`)
  if (chord.fingers.length !== 6) throw new Error(`${chord.id}: fingers must contain 6 values`)
  if (chord.frets.some((fret) => !Number.isInteger(fret) || fret < -1)) throw new Error(`${chord.id}: invalid fret`)
  if (chord.fingers.some((finger) => !Number.isInteger(finger) || finger < 0 || finger > 4)) throw new Error(`${chord.id}: invalid finger`)
  return true
}

export const getChord = (chords: GuitarChord[], root: NoteName, type: ChordType) => {
  const chord = chords.find((candidate) => candidate.root === root && candidate.type === type)
  if (!chord) throw new Error(`Chord not found: ${root}-${type}`)
  return chord
}
