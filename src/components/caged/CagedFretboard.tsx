import { useEffect, useMemo, useRef } from 'react'
import type { CagedDisplayMode, CagedLearningLayer, CagedPosition, CagedVoicingMode, FretboardTone } from '../../types/caged'
import type { AccidentalPreference, PitchClass, SoundingNote } from '../../types/music'
import { getFretboardChordTones } from '../../music/fretboardMap'
import { mapPitchToInterval } from '../../music/intervalMapper'
import { normalizePitchClass, pitchClassToNoteName } from '../../music/pitchClass'

const BOARD_X = 70
const FRET_WIDTH = 58
const STRING_YS = [48, 88, 128, 168, 208, 248]
const STRING_WIDTHS = [1, 1.4, 1.8, 2.2, 2.6, 3]
const FRET_MAX = 15
const fretX = (fret: number) => fret === 0 ? 40 : BOARD_X + (fret - 0.5) * FRET_WIDTH

export function CagedFretboard({ root, preference, position, displayMode, learningLayer, voicingMode, activeString, onPlayNote }: {
  root: PitchClass
  preference: AccidentalPreference
  position: CagedPosition
  displayMode: CagedDisplayMode
  learningLayer: CagedLearningLayer
  voicingMode: CagedVoicingMode
  activeString: number | null
  onPlayNote: (note: SoundingNote) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const allTones = useMemo(() => getFretboardChordTones(root, 'major', { min: 0, max: FRET_MAX }, preference), [root, preference])
  const shapeNotes = voicingMode === 'theory' ? position.theoryNotes : position.playableNotes
  const shapeTones: FretboardTone[] = shapeNotes.map((note) => ({
    ...note,
    pitchClass: normalizePitchClass(note.midi),
    interval: mapPitchToInterval(root, normalizePitchClass(note.midi)),
    isRoot: normalizePitchClass(note.midi) === root,
  }))
  const tones = learningLayer === 'shape' ? shapeTones : learningLayer === 'root' ? allTones.filter((tone) => tone.isRoot) : allTones

  useEffect(() => {
    if (!scrollRef.current) return
    const target = Math.max(0, fretX(position.startFret) - scrollRef.current.clientWidth / 2)
    scrollRef.current.scrollTo?.({ left: target, behavior: 'smooth' })
  }, [position])

  const areaStart = position.startFret === 0 ? 20 : fretX(position.startFret) - FRET_WIDTH / 2
  const areaEnd = fretX(Math.max(position.endFret, 1)) + FRET_WIDTH / 2
  return (
    <div className="caged-fretboard-scroll" ref={scrollRef} tabIndex={0} aria-label="0에서 15프렛 CAGED 전체 지판">
      <svg className="caged-fretboard" viewBox="0 0 990 305" role="img" aria-labelledby="caged-board-title caged-board-desc">
        <title id="caged-board-title">{pitchClassToNoteName(root, preference)} Major 전체 지판</title>
        <desc id="caged-board-desc">1번 줄부터 6번 줄까지 현재 코드의 Root와 코드톤을 0프렛부터 15프렛까지 표시합니다.</desc>
        <rect className="long-wood" x={BOARD_X} y="28" width={FRET_WIDTH * FRET_MAX} height="240" rx="3" />
        <rect className="shape-area" x={areaStart} y="25" width={areaEnd - areaStart} height="246" rx="10" />
        {[...Array(FRET_MAX + 1)].map((_, fret) => <line key={fret} className={fret === 0 ? 'nut' : 'fret'} x1={BOARD_X + fret * FRET_WIDTH} y1="28" x2={BOARD_X + fret * FRET_WIDTH} y2="268" />)}
        {[3, 5, 7, 9, 12, 15].map((fret) => (
          <g className="position-dot" key={fret}>
            <circle cx={fretX(fret)} cy={fret === 12 ? 111 : 148} r="4" />
            {fret === 12 && <circle cx={fretX(fret)} cy="185" r="4" />}
          </g>
        ))}
        {STRING_YS.map((y, index) => <line key={y} className={activeString === index + 1 ? 'guitar-string active-string' : 'guitar-string'} x1="20" y1={y} x2={BOARD_X + FRET_WIDTH * FRET_MAX} y2={y} strokeWidth={STRING_WIDTHS[index]} />)}
        {tones.map((tone) => {
          const label = displayMode === 'interval' ? tone.interval : pitchClassToNoteName(tone.pitchClass, preference)
          const fullInterval = tone.interval === 'R' ? 'Root' : tone.interval
          return (
            <g key={`${tone.stringNumber}-${tone.fret}`} className={tone.isRoot ? 'tone-marker root-tone' : 'tone-marker'} role="button" tabIndex={0} aria-label={`${tone.name}, ${fullInterval}, ${tone.stringNumber}번 현 ${tone.fret}프렛`} onClick={() => onPlayNote(tone)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onPlayNote(tone) }}>
              <title>{tone.stringNumber}번 현 · {tone.fret} Fret · {tone.name} · {fullInterval}</title>
              <circle cx={fretX(tone.fret)} cy={STRING_YS[tone.stringNumber - 1]} r={tone.isRoot ? 15 : 13} />
              <text x={fretX(tone.fret)} y={STRING_YS[tone.stringNumber - 1] + 1}>{label}</text>
            </g>
          )
        })}
        {[...Array(FRET_MAX)].map((_, index) => {
          const fret = index + 1
          return <text className="fret-number" key={fret} x={fretX(fret)} y="291">{[1, 3, 5, 7, 9, 12, 15].includes(fret) ? fret : ''}</text>
        })}
        {STRING_YS.map((y, index) => <text className="string-number" key={y} x="968" y={y + 1}>{index + 1}</text>)}
      </svg>
    </div>
  )
}
