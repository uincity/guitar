import { CHORD_FORMULAS } from '../data/chordFormulas'
import type { ChordQuality, GuitarVoicing } from '../types/chord'
import type { AccidentalPreference, PitchClass } from '../types/music'
import { pitchClassToNoteName } from './pitchClass'
import { generateChordVoicings } from './voicingGenerator'

export const getChordSymbol = (rootName: string, quality: ChordQuality) => `${rootName}${CHORD_FORMULAS[quality].suffix}`
export const getChordName = (rootName: string, quality: ChordQuality) => `${rootName} ${CHORD_FORMULAS[quality].name}`

export const generateChord = (root: PitchClass, quality: ChordQuality, preference: AccidentalPreference): GuitarVoicing[] => {
  const displayRoot = pitchClassToNoteName(root, preference)
  return generateChordVoicings(root, quality).map((voicing): GuitarVoicing => ({
    ...voicing,
    displayRoot,
    symbol: getChordSymbol(displayRoot, quality),
    name: getChordName(displayRoot, quality),
  }))
}
