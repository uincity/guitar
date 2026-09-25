import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { RootSelector } from './components/RootSelector'
import { AccidentalSelector } from './components/AccidentalSelector'
import { ChordTypeSelector } from './components/ChordTypeSelector'
import { ChordHeader } from './components/ChordHeader'
import { VoicingSelector } from './components/VoicingSelector'
import { AudioControls } from './components/AudioControls'
import { GuitarFretboard } from './components/GuitarFretboard'
import { ChordInfo } from './components/ChordInfo'
import { Legend } from './components/Legend'
import { CagedView } from './components/caged/CagedView'
import { SampleAudioEngine } from './audio/SampleAudioEngine'
import type { StrokeDirection } from './audio/AudioEngine'
import type { ChordQuality } from './types/chord'
import type { AccidentalPreference, PitchClass, SoundingNote } from './types/music'
import { generateChord } from './music/chordGenerator'
import { pitchClassToNoteName } from './music/pitchClass'
import { getSoundingNotes } from './utils/midi'
import './styles/globals.css'

export default function App() {
  const [root, setRoot] = useState<PitchClass>(0)
  const [quality, setQuality] = useState<ChordQuality>('major')
  const [preference, setPreference] = useState<AccidentalPreference>('auto')
  const [voicingIndex, setVoicingIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'chord' | 'caged'>('chord')
  const [activeString, setActiveString] = useState<number | null>(null)
  const engine = useRef(new SampleAudioEngine())
  const voicings = useMemo(() => generateChord(root, quality, preference), [root, quality, preference])
  const chord = voicings[voicingIndex] ?? voicings[0]
  const notes = useMemo(() => getSoundingNotes(chord, preference), [chord, preference])
  const displayRoot = pitchClassToNoteName(root, preference)

  useEffect(() => () => engine.current.stopAll(), [])
  useEffect(() => { void engine.current.preloadNotes(notes) }, [notes])
  useEffect(() => setVoicingIndex(0), [root, quality])
  const flash = (stringNumber: number) => {
    setActiveString(stringNumber)
    window.setTimeout(() => setActiveString((current) => current === stringNumber ? null : current), 190)
  }
  const playRawNote = (note: SoundingNote) => { void engine.current.playNote(note) }
  const playRawChord = (notesToPlay: SoundingNote[], direction: StrokeDirection, onString?: (stringNumber: number) => void) => { void engine.current.playChord(notesToPlay, direction, onString) }
  const playString = (note: SoundingNote) => { playRawNote(note); flash(note.stringNumber) }
  const playChord = (direction: StrokeDirection) => { playRawChord(notes, direction, flash) }

  return (
    <main>
      <div className="app-shell">
        <Header />
        <div className="view-switcher" aria-label="보기 모드">
          <button className={viewMode === 'chord' ? 'active' : ''} aria-pressed={viewMode === 'chord'} onClick={() => setViewMode('chord')}>코드</button>
          <button className={viewMode === 'caged' ? 'active' : ''} aria-pressed={viewMode === 'caged'} onClick={() => setViewMode('caged')}>CAGED</button>
        </div>
        <div className="selection-panel">
          <AccidentalSelector value={preference} onChange={setPreference} />
          <RootSelector value={root} preference={preference} onChange={setRoot} />
          {viewMode === 'chord' && <ChordTypeSelector root={displayRoot} value={quality} onChange={setQuality} />}
        </div>
        {viewMode === 'chord' ? (
          <>
            <section className="player-card" aria-live="polite">
              <ChordHeader chord={chord} />
              <VoicingSelector voicings={voicings} index={voicingIndex} onChange={setVoicingIndex} />
              <AudioControls onPlay={playChord} />
              <GuitarFretboard chord={chord} notes={notes} activeString={activeString} onPlayString={playString} />
              <Legend />
            </section>
            <ChordInfo chord={chord} notes={notes} />
          </>
        ) : <CagedView root={root} preference={preference} playNote={playRawNote} playChord={playRawChord} />}
        <footer>Standard tuning · E A D G B E</footer>
      </div>
    </main>
  )
}
