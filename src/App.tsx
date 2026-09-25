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
import { SynthAudioEngine } from './audio/SynthAudioEngine'
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
  const [activeString, setActiveString] = useState<number | null>(null)
  const engine = useRef(new SynthAudioEngine())
  const voicings = useMemo(() => generateChord(root, quality, preference), [root, quality, preference])
  const chord = voicings[voicingIndex] ?? voicings[0]
  const notes = useMemo(() => getSoundingNotes(chord, preference), [chord, preference])
  const displayRoot = pitchClassToNoteName(root, preference)

  useEffect(() => () => engine.current.stopAll(), [])
  useEffect(() => setVoicingIndex(0), [root, quality])
  const flash = (stringNumber: number) => {
    setActiveString(stringNumber)
    window.setTimeout(() => setActiveString((current) => current === stringNumber ? null : current), 190)
  }
  const playString = (note: SoundingNote) => { void engine.current.playNote(note); flash(note.stringNumber) }
  const playChord = (direction: StrokeDirection) => { void engine.current.playChord(notes, direction, flash) }

  return (
    <main>
      <div className="app-shell">
        <Header />
        <div className="selection-panel">
          <AccidentalSelector value={preference} onChange={setPreference} />
          <RootSelector value={root} preference={preference} onChange={setRoot} />
          <ChordTypeSelector root={displayRoot} value={quality} onChange={setQuality} />
        </div>
        <section className="player-card" aria-live="polite">
          <ChordHeader chord={chord} />
          <VoicingSelector voicings={voicings} index={voicingIndex} onChange={setVoicingIndex} />
          <AudioControls onPlay={playChord} />
          <GuitarFretboard chord={chord} notes={notes} activeString={activeString} onPlayString={playString} />
          <Legend />
        </section>
        <ChordInfo chord={chord} notes={notes} />
        <footer>Standard tuning · E A D G B E</footer>
      </div>
    </main>
  )
}
