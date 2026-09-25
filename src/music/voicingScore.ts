import type { ChordShape } from '../types/chord'

export const scoreVoicing = (shape: ChordShape, frets: number[]) => {
  const pressed = frets.filter((fret) => fret > 0)
  const maxFret = Math.max(0, ...pressed)
  const minFret = Math.min(...pressed, maxFret)
  const span = maxFret - minFret
  const openBonus = shape.family === 'open' ? -1000 : 0
  const commonBonus = -(shape.commonness ?? 0) * 5
  return openBonus + commonBonus + maxFret * 10 + span * 6
}
