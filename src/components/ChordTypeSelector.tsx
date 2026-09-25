import { CHORD_TYPES, type ChordType, type NoteName } from '../types/chord'

const labels: Record<ChordType, string> = { major: 'Major', minor: 'Minor', '7': '7', maj7: 'Maj7', m7: 'm7' }
const symbols: Record<ChordType, string> = { major: '', minor: 'm', '7': '7', maj7: 'maj7', m7: 'm7' }

export function ChordTypeSelector({ root, value, onChange }: { root: NoteName; value: ChordType; onChange: (type: ChordType) => void }) {
  return (
    <section aria-labelledby="type-heading">
      <div className="section-label" id="type-heading">코드 타입</div>
      <div className="selector-grid type-selector">
        {CHORD_TYPES.map((type) => (
          <button key={type} className={value === type ? 'type-button active' : 'type-button'} aria-pressed={value === type} onClick={() => onChange(type)}>
            <strong>{root}{symbols[type]}</strong><span>{labels[type]}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
