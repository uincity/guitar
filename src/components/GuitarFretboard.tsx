import type { GuitarChord, SoundingNote } from '../types/chord'
import { FingerMarker } from './FingerMarker'

const stringYs = [55, 91, 127, 163, 199, 235]
const fretXs = [65, 133, 201, 269, 337, 405]
const widths = [3, 2.6, 2.2, 1.8, 1.4, 1]
const displayedStringNumbers = [1, 2, 3, 4, 5, 6]

export function GuitarFretboard({ chord, notes, activeString, onPlayString }: {
  chord: GuitarChord
  notes: SoundingNote[]
  activeString: number | null
  onPlayString: (note: SoundingNote) => void
}) {
  const noteFor = (stringNumber: number) => notes.find((note) => note.stringNumber === stringNumber)
  return (
    <div className="fretboard-wrap">
      <svg className="fretboard" viewBox="0 0 450 285" role="img" aria-labelledby="fret-title fret-desc">
        <title id="fret-title">{chord.name} 기타 코드 운지</title>
        <desc id="fret-desc">위에서부터 1번 줄에서 6번 줄, 왼쪽부터 1프렛에서 5프렛입니다.</desc>
        <rect className="wood" x="64" y="37" width="342" height="216" rx="3" />
        {fretXs.map((x, index) => <line key={x} className={index === 0 ? 'nut' : 'fret'} x1={x} y1="37" x2={x} y2="253" />)}
        {displayedStringNumbers.map((stringNumber, index) => (
          <line
            key={stringNumber}
            className={activeString === stringNumber ? 'guitar-string active-string' : 'guitar-string'}
            x1="64"
            y1={stringYs[index]}
            x2="406"
            y2={stringYs[index]}
            strokeWidth={widths[6 - stringNumber]}
          />
        ))}

        {chord.barre && (() => {
          const x = (fretXs[chord.barre.fret - 1] + fretXs[chord.barre.fret]) / 2
          const y1 = stringYs[chord.barre.fromString - 1]
          const y2 = stringYs[chord.barre.toString - 1]
          return <line className="barre" x1={x} y1={y1} x2={x} y2={y2} />
        })()}

        {displayedStringNumbers.map((stringNumber, displayIndex) => {
          const dataIndex = 6 - stringNumber
          const fret = chord.frets[dataIndex]
          const note = noteFor(stringNumber)
          const y = stringYs[displayIndex]
          if (fret <= 0) return (
            <g key={stringNumber} className="open-muted">
              <text x="40" y={y + 1}>{fret === 0 ? 'O' : '×'}</text>
              {note && <circle className="hit-area" cx="40" cy={y} r="18" role="button" tabIndex={0} aria-label={`${note.stringNumber}번 줄 ${note.name} 재생`} onClick={() => onPlayString(note)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPlayString(note) }} />}
            </g>
          )
          const x = (fretXs[fret - 1] + fretXs[fret]) / 2
          return (
            <g key={stringNumber} role="button" tabIndex={0} aria-label={`${note?.stringNumber}번 줄 ${note?.name} 재생`} onClick={() => note && onPlayString(note)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && note) onPlayString(note) }}>
              <FingerMarker x={x} y={y} finger={chord.fingers[dataIndex]} active={activeString === stringNumber} />
              <circle className="hit-area" cx={x} cy={y} r="21" />
            </g>
          )
        })}

        {[1, 2, 3, 4, 5].map((fret) => <text className="fret-number" key={fret} x={(fretXs[fret - 1] + fretXs[fret]) / 2} y="276">{fret}</text>)}
        {displayedStringNumbers.map((stringNumber, index) => <text className="string-number" key={stringNumber} x="424" y={stringYs[index] + 1}>{stringNumber}</text>)}
      </svg>
      <p className="tap-hint">● 표시를 눌러 각 줄의 소리를 들어보세요</p>
    </div>
  )
}
