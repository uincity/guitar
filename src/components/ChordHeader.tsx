import type { GuitarVoicing } from '../types/chord'

export function ChordHeader({ chord }: { chord: GuitarVoicing }) {
  return <div className="chord-header"><span className="eyebrow">NOW PLAYING</span><h2>{chord.symbol}</h2><p>{chord.name}</p></div>
}
