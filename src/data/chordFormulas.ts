import type { ChordQuality } from '../types/chord'

export const CHORD_FORMULAS: Record<ChordQuality, { intervals: number[]; degrees: number[]; name: string; suffix: string }> = {
  major: { intervals: [0, 4, 7], degrees: [0, 2, 4], name: 'Major', suffix: '' },
  minor: { intervals: [0, 3, 7], degrees: [0, 2, 4], name: 'Minor', suffix: 'm' },
  '7': { intervals: [0, 4, 7, 10], degrees: [0, 2, 4, 6], name: 'Dominant 7', suffix: '7' },
  maj7: { intervals: [0, 4, 7, 11], degrees: [0, 2, 4, 6], name: 'Major 7', suffix: 'maj7' },
  m7: { intervals: [0, 3, 7, 10], degrees: [0, 2, 4, 6], name: 'Minor 7', suffix: 'm7' },
}

export const getChordIntervals = (quality: ChordQuality) => [...CHORD_FORMULAS[quality].intervals]
