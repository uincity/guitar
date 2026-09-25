import { CHORD_FORMULAS } from '../data/chordFormulas'
import type { ChordQuality } from '../types/chord'
import type { AccidentalPreference, NoteName } from '../types/music'
import { noteNameToPitchClass, normalizePitchClass, pitchClassToNoteName } from './pitchClass'

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const NATURAL_PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const AWKWARD = new Set(['E#', 'B#', 'Cb', 'Fb'])

export const spellChord = (rootName: string, quality: ChordQuality, preference: AccidentalPreference = 'auto') => {
  const formula = CHORD_FORMULAS[quality]
  const rootPitch = noteNameToPitchClass(rootName as NoteName)
  const rootLetterIndex = LETTERS.indexOf(rootName[0] as (typeof LETTERS)[number])

  return formula.intervals.map((interval, index) => {
    if (index === 0) return rootName
    const targetPitch = normalizePitchClass(rootPitch + interval)
    const letter = LETTERS[(rootLetterIndex + formula.degrees[index]) % 7]
    let difference = targetPitch - NATURAL_PITCH[letter]
    if (difference > 6) difference -= 12
    if (difference < -6) difference += 12
    const spelled = difference === 0 ? letter : difference === 1 ? `${letter}#` : difference === -1 ? `${letter}b` : ''
    return spelled && !AWKWARD.has(spelled) ? spelled : pitchClassToNoteName(targetPitch, preference)
  })
}
