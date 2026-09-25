import type { ChordQuality } from '../types/chord'
import type { PitchClass } from '../types/music'
import { getChordIntervals } from '../data/chordFormulas'
import { normalizePitchClass } from './pitchClass'

const INTERVAL_LABELS = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'] as const

export const mapPitchToInterval = (root: PitchClass, pitch: PitchClass) => INTERVAL_LABELS[normalizePitchClass(pitch - root)]

export const getChordPitchClasses = (root: PitchClass, quality: ChordQuality) =>
  getChordIntervals(quality).map((interval) => normalizePitchClass(root + interval))
