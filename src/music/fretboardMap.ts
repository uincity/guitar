import { STANDARD_TUNING } from '../data/tuning'
import type { ChordQuality } from '../types/chord'
import type { FretRange, FretboardTone } from '../types/caged'
import type { AccidentalPreference, PitchClass } from '../types/music'
import { mapPitchToInterval, getChordPitchClasses } from './intervalMapper'
import { normalizePitchClass } from './pitchClass'
import { midiToFrequency, midiToNoteName } from '../utils/midi'

export const getFretboardNote = (stringNumber: number, fret: number, preference: AccidentalPreference = 'auto'): FretboardTone => {
  if (stringNumber < 1 || stringNumber > 6) throw new Error('String number must be between 1 and 6')
  if (fret < 0) throw new Error('Fret must be zero or greater')
  const midi = STANDARD_TUNING[6 - stringNumber] + fret
  const pitchClass = normalizePitchClass(midi)
  return {
    stringNumber, fret, midi, pitchClass, name: midiToNoteName(midi, preference),
    frequency: midiToFrequency(midi), interval: '', isRoot: false,
  }
}

export const getFretboardChordTones = (
  root: PitchClass,
  quality: ChordQuality,
  fretRange: FretRange = { min: 0, max: 15 },
  preference: AccidentalPreference = 'auto',
): FretboardTone[] => {
  const chordPitches = new Set<PitchClass>(getChordPitchClasses(root, quality))
  const tones: FretboardTone[] = []
  for (let stringNumber = 1; stringNumber <= 6; stringNumber += 1) {
    for (let fret = fretRange.min; fret <= fretRange.max; fret += 1) {
      const note = getFretboardNote(stringNumber, fret, preference)
      if (!chordPitches.has(note.pitchClass)) continue
      tones.push({ ...note, interval: mapPitchToInterval(root, note.pitchClass), isRoot: note.pitchClass === root })
    }
  }
  return tones
}
