import { Play } from 'lucide-react'
import type { CagedPosition, CagedShapeName } from '../../types/caged'

export function CagedShapeSelector({ positions, selected, onSelect, onPlay }: {
  positions: CagedPosition[]
  selected: CagedShapeName
  onSelect: (shape: CagedShapeName) => void
  onPlay: (position: CagedPosition) => void
}) {
  return (
    <nav className="caged-shape-selector" aria-label="CAGED Shape 선택">
      {positions.map((position, index) => (
        <div className={selected === position.shape ? 'caged-shape-option active' : 'caged-shape-option'} key={position.shape}>
          <button className="shape-select" aria-pressed={selected === position.shape} onClick={() => onSelect(position.shape)}>
            <strong>{position.shape}</strong><span>{position.startFret}–{position.endFret}F</span>
          </button>
          <button className="shape-play" aria-label={`${position.shape} Shape 듣기`} onClick={() => onPlay(position)}><Play size={12} fill="currentColor" /></button>
          {index < positions.length - 1 && <i aria-hidden="true">→</i>}
        </div>
      ))}
    </nav>
  )
}
