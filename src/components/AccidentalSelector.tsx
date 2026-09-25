import type { AccidentalPreference } from '../types/music'

const options: { value: AccidentalPreference; label: string; detail: string }[] = [
  { value: 'auto', label: '자동', detail: 'Auto' },
  { value: 'flat', label: '♭', detail: 'Flat' },
  { value: 'sharp', label: '♯', detail: 'Sharp' },
]

export function AccidentalSelector({ value, onChange }: { value: AccidentalPreference; onChange: (value: AccidentalPreference) => void }) {
  return (
    <section aria-labelledby="accidental-heading">
      <div className="section-label" id="accidental-heading">음이름 표기</div>
      <div className="accidental-selector">
        {options.map((option) => (
          <button key={option.value} className={value === option.value ? 'accidental-button active' : 'accidental-button'} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            <strong>{option.label}</strong><span>{option.detail}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
