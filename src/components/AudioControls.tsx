import { ArrowDown, ArrowUp, Play } from 'lucide-react'
import type { StrokeDirection } from '../audio/AudioEngine'

export function AudioControls({ onPlay }: { onPlay: (direction: StrokeDirection) => void }) {
  return (
    <div className="audio-controls">
      <button className="play-primary" onClick={() => onPlay('down')} aria-label="코드 재생"><Play size={20} fill="currentColor" /> Play</button>
      <button onClick={() => onPlay('down')} aria-label="다운 스트로크 재생"><ArrowDown size={18} /> Down</button>
      <button onClick={() => onPlay('up')} aria-label="업 스트로크 재생"><ArrowUp size={18} /> Up</button>
    </div>
  )
}
