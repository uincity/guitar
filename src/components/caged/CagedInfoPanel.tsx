import type { CagedPosition, CagedVoicingMode } from '../../types/caged'
import type { AccidentalPreference } from '../../types/music'
import { spellChord } from '../../music/chordSpelling'
import { pitchClassToNoteName } from '../../music/pitchClass'

export function CagedInfoPanel({ position, preference, voicingMode }: { position: CagedPosition; preference: AccidentalPreference; voicingMode: CagedVoicingMode }) {
  const rootName = pitchClassToNoteName(position.root, preference)
  const baseName = pitchClassToNoteName(position.baseRoot, 'auto')
  const frets = voicingMode === 'theory' ? position.theoryFrets : position.playableFrets
  const notes = voicingMode === 'theory' ? position.theoryNotes : position.playableNotes
  const rootPositions = position.rootPositions.map((root) => `${root.stringNumber}번현 ${root.fret}F`).join(' · ')
  return (
    <section className="caged-info-card" aria-labelledby="caged-info-title">
      <div className="caged-info-heading">
        <div><span className="eyebrow">CAGED POSITION</span><h3 id="caged-info-title">{rootName} Major — {position.shape} Shape</h3></div>
        {(() => {
          const difficulty = voicingMode === 'theory' ? position.theoryDifficulty : position.playableDifficulty
          return <span className={`difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span>
        })()}
      </div>
      <p className="shape-description">{position.description}</p>
      <dl>
        <div><dt>기준 Shape</dt><dd>{baseName} Major</dd></div>
        <div><dt>이동</dt><dd>{baseName} → {rootName} · +{position.offset} semitones</dd></div>
        <div><dt>Position</dt><dd>{position.startFret}–{position.endFret} fret</dd></div>
        <div><dt>Root 위치</dt><dd>{rootPositions}</dd></div>
        <div><dt>구성음</dt><dd>{spellChord(rootName, 'major', preference).join(' · ')}</dd></div>
        <div><dt>인터벌</dt><dd>R · 3 · 5</dd></div>
        <div><dt>운지</dt><dd>{frets.map((fret) => fret < 0 ? 'X' : fret).join(' · ')}</dd></div>
        <div><dt>실제 연주음</dt><dd>{notes.map((note) => note.name).join(' · ')}</dd></div>
        <div><dt>Voicing</dt><dd>{voicingMode === 'theory' ? '전체 Theory Shape' : position.playableLabel}</dd></div>
      </dl>
    </section>
  )
}
