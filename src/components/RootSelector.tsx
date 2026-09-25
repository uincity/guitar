import { ROOT_NOTES, type NoteName } from '../types/chord'

export function RootSelector({ value, onChange }: { value: NoteName; onChange: (root: NoteName) => void }) {
  return (
    <section aria-labelledby="root-heading">
      <div className="section-label" id="root-heading">루트 음</div>
      <div className="selector-grid root-selector">
        {ROOT_NOTES.map((root) => (
          <button key={root} className={value === root ? 'selector active' : 'selector'} aria-pressed={value === root} onClick={() => onChange(root)}>
            {root}
          </button>
        ))}
      </div>
    </section>
  )
}
