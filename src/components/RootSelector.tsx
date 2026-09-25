import type { AccidentalPreference, PitchClass } from '../types/music'
import { getRootOptions } from '../music/pitchClass'

export function RootSelector({ value, preference, onChange }: { value: PitchClass; preference: AccidentalPreference; onChange: (root: PitchClass) => void }) {
  const roots = getRootOptions(preference)
  return (
    <section aria-labelledby="root-heading">
      <div className="section-label" id="root-heading">루트 음</div>
      <div className="selector-grid root-selector">
        {roots.map((root) => (
          <button key={root.pitchClass} className={value === root.pitchClass ? 'selector active' : 'selector'} aria-pressed={value === root.pitchClass} onClick={() => onChange(root.pitchClass)}>
            {root.name}
          </button>
        ))}
      </div>
    </section>
  )
}
