import type { GuitarChord, SoundingNote } from '../types/chord'
import { getChordTones } from '../utils/chordUtils'

export function ChordInfo({ chord, notes }: { chord: GuitarChord; notes: SoundingNote[] }) {
  const frets = chord.frets.map((fret) => fret < 0 ? 'X' : fret).join(' · ')
  return (
    <section className="info-card" aria-labelledby="chord-info-title">
      <div className="info-title"><div><span className="eyebrow">CHORD DETAILS</span><h3 id="chord-info-title">{chord.name}</h3></div><span className="symbol-chip">{chord.symbol}</span></div>
      <dl>
        <div><dt>구성음</dt><dd>{getChordTones(chord.root, chord.type).join(' · ')}</dd></div>
        <div><dt>실제 연주음</dt><dd>{notes.map((note) => note.name).join(' · ')}</dd></div>
        <div><dt>운지</dt><dd>{frets}</dd></div>
      </dl>
    </section>
  )
}
