import { useEffect, useMemo, useRef, useState } from 'react'
import { ListMusic } from 'lucide-react'
import type { StrokeDirection } from '../../audio/AudioEngine'
import type { GuitarVoicing } from '../../types/chord'
import { CAGED_SHAPE_ORDER, type CagedDisplayMode, type CagedFretboardMode, type CagedLearningLayer, type CagedOrderMode, type CagedShapeName, type CagedVoicingMode } from '../../types/caged'
import type { AccidentalPreference, PitchClass, SoundingNote } from '../../types/music'
import { generateCagedPositions, sortCagedPositionsByFret } from '../../music/cagedGenerator'
import { pitchClassToNoteName } from '../../music/pitchClass'
import { AudioControls } from '../AudioControls'
import { GuitarFretboard } from '../GuitarFretboard'
import { Legend } from '../Legend'
import { CagedDisplayControls } from './CagedDisplayControls'
import { CagedFretboard } from './CagedFretboard'
import { CagedInfoPanel } from './CagedInfoPanel'
import { CagedShapeSelector } from './CagedShapeSelector'

const toGuitarVoicing = (position: ReturnType<typeof generateCagedPositions>[number], mode: CagedVoicingMode, rootName: string): GuitarVoicing => {
  const frets = mode === 'theory' ? position.theoryFrets : position.playableFrets
  const positive = frets.filter((fret) => fret > 0)
  const min = positive.length ? Math.min(...positive) : 1
  return {
    id: `${position.id}-${mode}`, root: position.root, quality: 'major', displayRoot: rootName,
    symbol: rootName, name: `${rootName} Major`, shapeId: position.id, shapeName: `${position.shape} Shape`, family: 'other',
    frets, fingers: mode === 'theory' ? position.theoryFingers : position.playableFingers,
    barre: mode === 'theory' ? position.theoryBarre : position.playableBarre,
    startFret: min <= 1 ? 1 : min, displayFrets: 5, score: 0,
  }
}

export function CagedView({ root, preference, playNote, playChord }: {
  root: PitchClass
  preference: AccidentalPreference
  playNote: (note: SoundingNote) => void
  playChord: (notes: SoundingNote[], direction: StrokeDirection, onString?: (stringNumber: number) => void) => void
}) {
  const positions = useMemo(() => generateCagedPositions(root, 'major', { min: 0, max: 15 }, preference), [root, preference])
  const [selectedShape, setSelectedShape] = useState<CagedShapeName>('C')
  const [displayMode, setDisplayMode] = useState<CagedDisplayMode>('interval')
  const [learningLayer, setLearningLayer] = useState<CagedLearningLayer>('shape')
  const [voicingMode, setVoicingMode] = useState<CagedVoicingMode>('theory')
  const [fretboardMode, setFretboardMode] = useState<CagedFretboardMode>('position')
  const [orderMode, setOrderMode] = useState<CagedOrderMode>('fret')
  const [activeString, setActiveString] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const orderedPositions = orderMode === 'fret' ? sortCagedPositionsByFret(positions) : CAGED_SHAPE_ORDER.map((shape) => positions.find((position) => position.shape === shape)!)
  const selected = positions.find((position) => position.shape === selectedShape) ?? positions[0]
  const rootName = pitchClassToNoteName(root, preference)
  const notes = voicingMode === 'theory' ? selected.theoryNotes : selected.playableNotes
  const voicing = toGuitarVoicing(selected, voicingMode, rootName)

  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = [] }
  useEffect(() => () => clearTimers(), [])
  useEffect(() => {
    const first = sortCagedPositionsByFret(positions)[0]
    setSelectedShape(first.shape)
  }, [root])

  const flash = (stringNumber: number) => {
    setActiveString(stringNumber)
    window.setTimeout(() => setActiveString((current) => current === stringNumber ? null : current), 190)
  }
  const handleNote = (note: SoundingNote) => { playNote(note); flash(note.stringNumber) }
  const handlePositionPlay = (position: typeof selected, direction: StrokeDirection = 'down') => {
    const positionNotes = voicingMode === 'theory' ? position.theoryNotes : position.playableNotes
    playChord(positionNotes, direction, flash)
  }
  const playAll = () => {
    clearTimers()
    CAGED_SHAPE_ORDER.forEach((shape, index) => {
      const position = positions.find((candidate) => candidate.shape === shape)!
      timers.current.push(window.setTimeout(() => {
        setSelectedShape(shape)
        handlePositionPlay(position)
      }, index * 1000))
    })
  }

  return (
    <section className="caged-view">
      <header className="caged-header"><span className="eyebrow">CAGED LEARNING</span><h2>{rootName} Major</h2><p>하나의 코드를 지판 전체의 다섯 Shape로 연결해 보세요.</p></header>
      <CagedDisplayControls fretboardMode={fretboardMode} setFretboardMode={setFretboardMode} displayMode={displayMode} setDisplayMode={setDisplayMode} learningLayer={learningLayer} setLearningLayer={setLearningLayer} voicingMode={voicingMode} setVoicingMode={setVoicingMode} orderMode={orderMode} setOrderMode={setOrderMode} />
      <CagedShapeSelector positions={orderedPositions} selected={selected.shape} onSelect={setSelectedShape} onPlay={handlePositionPlay} />
      <button className="play-sequence" onClick={playAll} aria-label="CAGED 순서로 모두 듣기"><ListMusic size={18} /> CAGED 순서로 듣기</button>

      <div className="caged-board-card">
        <div className="position-meta"><strong>{selected.shape} Shape</strong><span>{selected.startFret}–{selected.endFret} fret · {voicingMode === 'theory' ? 'Theory' : selected.playableLabel}</span></div>
        <AudioControls onPlay={(direction) => handlePositionPlay(selected, direction)} />
        {fretboardMode === 'position' ? (
          <><GuitarFretboard chord={voicing} notes={notes} activeString={activeString} onPlayString={handleNote} /><Legend /></>
        ) : (
          <CagedFretboard root={root} preference={preference} position={selected} displayMode={displayMode} learningLayer={learningLayer} voicingMode={voicingMode} activeString={activeString} onPlayNote={handleNote} />
        )}
      </div>
      <CagedInfoPanel position={selected} preference={preference} voicingMode={voicingMode} />
      <p className="octave-note">12프렛 이후에는 같은 CAGED Shape Cycle이 한 옥타브 위에서 반복됩니다.</p>
    </section>
  )
}
