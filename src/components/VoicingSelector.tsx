import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { GuitarVoicing } from '../types/chord'

export function VoicingSelector({ voicings, index, onChange }: { voicings: GuitarVoicing[]; index: number; onChange: (index: number) => void }) {
  const selected = voicings[index] ?? voicings[0]
  return (
    <div className="voicing-selector" aria-label="운지 선택">
      <button aria-label="이전 운지" disabled={voicings.length < 2} onClick={() => onChange((index - 1 + voicings.length) % voicings.length)}><ChevronLeft size={18} /></button>
      <div><span>VOICING</span><strong>{selected.shapeName}</strong><small>{index + 1} / {voicings.length}</small></div>
      <button aria-label="다음 운지" disabled={voicings.length < 2} onClick={() => onChange((index + 1) % voicings.length)}><ChevronRight size={18} /></button>
    </div>
  )
}
