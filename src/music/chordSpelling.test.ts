import { spellChord } from './chordSpelling'

describe('enharmonic chord spelling', () => {
  it.each([
    ['Bb', 'major', ['Bb', 'D', 'F']],
    ['Db', 'major', ['Db', 'F', 'Ab']],
    ['Eb', 'minor', ['Eb', 'Gb', 'Bb']],
    ['F#', 'major', ['F#', 'A#', 'C#']],
    ['Bb', '7', ['Bb', 'D', 'F', 'Ab']],
  ] as const)('spells %s %s correctly', (root, quality, expected) => {
    expect(spellChord(root, quality)).toEqual(expected)
  })
})
