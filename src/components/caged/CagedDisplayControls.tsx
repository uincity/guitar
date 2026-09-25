import type { CagedDisplayMode, CagedFretboardMode, CagedLearningLayer, CagedOrderMode, CagedVoicingMode } from '../../types/caged'

function ControlGroup<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="caged-control-group">
      <span>{label}</span>
      <div>{options.map((option) => <button key={option.value} aria-pressed={value === option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>
    </div>
  )
}

export function CagedDisplayControls(props: {
  fretboardMode: CagedFretboardMode; setFretboardMode: (value: CagedFretboardMode) => void
  displayMode: CagedDisplayMode; setDisplayMode: (value: CagedDisplayMode) => void
  learningLayer: CagedLearningLayer; setLearningLayer: (value: CagedLearningLayer) => void
  voicingMode: CagedVoicingMode; setVoicingMode: (value: CagedVoicingMode) => void
  orderMode: CagedOrderMode; setOrderMode: (value: CagedOrderMode) => void
}) {
  return (
    <div className="caged-controls">
      <ControlGroup label="보기" value={props.fretboardMode} onChange={props.setFretboardMode} options={[{ value: 'position', label: '개별 Shape' }, { value: 'full', label: '전체 지판' }]} />
      <ControlGroup label="표시" value={props.displayMode} onChange={props.setDisplayMode} options={[{ value: 'note', label: '음이름' }, { value: 'interval', label: '인터벌' }]} />
      <ControlGroup label="학습" value={props.learningLayer} onChange={props.setLearningLayer} options={[{ value: 'root', label: '1 Root 찾기' }, { value: 'chord-tones', label: '2 코드톤' }, { value: 'shape', label: '3 Shape' }]} />
      <ControlGroup label="운지" value={props.voicingMode} onChange={props.setVoicingMode} options={[{ value: 'theory', label: '이론형' }, { value: 'playable', label: '실전형' }]} />
      <ControlGroup label="순서" value={props.orderMode} onChange={props.setOrderMode} options={[{ value: 'fret', label: '지판 순서' }, { value: 'caged', label: 'CAGED 순서' }]} />
    </div>
  )
}
