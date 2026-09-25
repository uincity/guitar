import { noteNameToPitchClass, pitchClassToNoteName } from './pitchClass'

describe('pitch class engine', () => {
  it.each([['C#', 'Db'], ['D#', 'Eb'], ['F#', 'Gb'], ['G#', 'Ab'], ['A#', 'Bb']] as const)('%s and %s are enharmonic', (sharp, flat) => {
    expect(noteNameToPitchClass(sharp)).toBe(noteNameToPitchClass(flat))
  })

  it('renders the same pitch class using the selected accidental', () => {
    expect(pitchClassToNoteName(1, 'flat')).toBe('Db')
    expect(pitchClassToNoteName(1, 'sharp')).toBe('C#')
  })
})
