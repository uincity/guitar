import { CHORD_QUALITIES, type ChordQuality } from '../types/chord'

const labels: Record<ChordQuality, string> = { major: 'Major', minor: 'Minor', '7': '7', maj7: 'Maj7', m7: 'm7' }
const symbols: Record<ChordQuality, string> = { major: '', minor: 'm', '7': '7', maj7: 'maj7', m7: 'm7' }

export function ChordTypeSelector({ root, value, onChange }: { root: string; value: ChordQuality; onChange: (type: ChordQuality) => void }) {
  return (
    <section aria-labelledby="type-heading">
      <div className="section-label" id="type-heading">코드 타입</div>
      <div className="selector-grid type-selector">
        {CHORD_QUALITIES.map((type) => (
          <button key={type} className={value === type ? 'type-button active' : 'type-button'} aria-pressed={value === type} onClick={() => onChange(type)}>
            <strong>{root}{symbols[type]}</strong><span>{labels[type]}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
