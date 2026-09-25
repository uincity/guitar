import type { GuitarChord } from '../types/chord'

export function ChordHeader({ chord }: { chord: GuitarChord }) {
  return <div className="chord-header"><span className="eyebrow">NOW PLAYING</span><h2>{chord.symbol}</h2><p>{chord.name}</p></div>
}
