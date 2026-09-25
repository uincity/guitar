import type { GuitarVoicing } from '../types/chord'
import type { SoundingNote } from '../types/music'
import { FingerMarker } from './FingerMarker'

const stringYs = [55, 91, 127, 163, 199, 235]
const fretXs = [65, 133, 201, 269, 337, 405]
const widths = [3, 2.6, 2.2, 1.8, 1.4, 1]
const displayedStringNumbers = [1, 2, 3, 4, 5, 6]

export function GuitarFretboard({ chord, notes, activeString, onPlayString }: {
  chord: GuitarVoicing
  notes: SoundingNote[]
  activeString: number | null
  onPlayString: (note: SoundingNote) => void
}) {
  const noteFor = (stringNumber: number) => notes.find((note) => note.stringNumber === stringNumber)
  const fretToX = (fret: number) => {
    const position = fret - chord.startFret
    return (fretXs[position] + fretXs[position + 1]) / 2
  }
  const visibleFrets = Array.from({ length: chord.displayFrets }, (_, index) => chord.startFret + index)
  return (
    <div className="fretboard-wrap">
      <svg className="fretboard" viewBox="0 0 450 285" role="img" aria-labelledby="fret-title fret-desc">
        <title id="fret-title">{chord.name} 기타 코드 운지</title>
        <desc id="fret-desc">위에서부터 1번 줄에서 6번 줄, 왼쪽부터 {chord.startFret}프렛에서 {chord.startFret + chord.displayFrets - 1}프렛입니다.</desc>
        <rect className="wood" x="64" y="37" width="342" height="216" rx="3" />
        {fretXs.map((x, index) => <line key={x} className={index === 0 && chord.startFret === 1 ? 'nut' : 'fret'} x1={x} y1="37" x2={x} y2="253" />)}
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
          const x = fretToX(chord.barre.fret)
          const y1 = stringYs[chord.barre.fromString - 1]
          const y2 = stringYs[chord.barre.toString - 1]
          return (
            <g aria-hidden="true">
              <line className="barre" x1={x} y1={y1} x2={x} y2={y2} />
              <FingerMarker x={x} y={y1} finger={chord.barre.finger} active={activeString === chord.barre.fromString} />
            </g>
          )
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
          const x = fretToX(fret)
          const isBarred = chord.barre && fret === chord.barre.fret && stringNumber <= chord.barre.fromString && stringNumber >= chord.barre.toString
          return (
            <g key={stringNumber} role="button" tabIndex={0} aria-label={`${note?.stringNumber}번 줄 ${note?.name} 재생`} onClick={() => note && onPlayString(note)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && note) onPlayString(note) }}>
              {!isBarred && <FingerMarker x={x} y={y} finger={chord.fingers[dataIndex]} active={activeString === stringNumber} />}
              <circle className="hit-area" cx={x} cy={y} r="21" />
            </g>
          )
        })}

        {visibleFrets.map((fret, index) => <text className="fret-number" key={fret} x={(fretXs[index] + fretXs[index + 1]) / 2} y="276">{fret}</text>)}
        {displayedStringNumbers.map((stringNumber, index) => <text className="string-number" key={stringNumber} x="424" y={stringYs[index] + 1}>{stringNumber}</text>)}
      </svg>
      <p className="tap-hint">● 표시를 눌러 각 줄의 소리를 들어보세요</p>
    </div>
  )
}
