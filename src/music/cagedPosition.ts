import type { CagedPosition } from '../types/caged'

export const getCagedShapePosition = (frets: number[]) => {
  const soundingFrets = frets.filter((fret) => fret >= 0)
  if (!soundingFrets.length) throw new Error('A CAGED position must contain a sounding string')
  return { startFret: Math.min(...soundingFrets), endFret: Math.max(...soundingFrets) }
}

export const sortCagedPositionsByFret = (positions: CagedPosition[]) =>
  [...positions].sort((a, b) => a.startFret - b.startFret || a.endFret - b.endFret)
