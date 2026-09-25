export function FingerMarker({ x, y, finger, active }: { x: number; y: number; finger: number; active: boolean }) {
  return (
    <g className={active ? 'finger-marker sounding' : 'finger-marker'} aria-hidden="true">
      <circle cx={x} cy={y} r="15" />
      <text x={x} y={y + 1}>{finger || ''}</text>
    </g>
  )
}
