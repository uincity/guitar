import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { RootSelector } from './components/RootSelector'
import { ChordTypeSelector } from './components/ChordTypeSelector'
import { ChordHeader } from './components/ChordHeader'
import { AudioControls } from './components/AudioControls'
import { GuitarFretboard } from './components/GuitarFretboard'
import { ChordInfo } from './components/ChordInfo'
import { Legend } from './components/Legend'
import { chords } from './data/chords'
import { SynthAudioEngine } from './audio/SynthAudioEngine'
import type { StrokeDirection } from './audio/AudioEngine'
import type { ChordType, NoteName, SoundingNote } from './types/chord'
import { getChord } from './utils/chordUtils'
import { getChordSoundingNotes } from './utils/musicTheory'
import './styles/globals.css'

export default function App() {
  const [root, setRoot] = useState<NoteName>('C')
  const [type, setType] = useState<ChordType>('major')
  const [activeString, setActiveString] = useState<number | null>(null)
  const engine = useRef(new SynthAudioEngine())
  const chord = useMemo(() => getChord(chords, root, type), [root, type])
  const notes = useMemo(() => getChordSoundingNotes(chord), [chord])

  useEffect(() => () => engine.current.stopAll(), [])
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
          <RootSelector value={root} onChange={setRoot} />
          <ChordTypeSelector root={root} value={type} onChange={setType} />
        </div>
        <section className="player-card" aria-live="polite">
          <ChordHeader chord={chord} />
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
