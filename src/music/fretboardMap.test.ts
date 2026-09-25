import { getFretboardChordTones, getFretboardNote } from './fretboardMap'

describe('CAGED fretboard map', () => {
  it('shows only C pitch classes in a C Root map', () => {
    const roots = getFretboardChordTones(0, 'major').filter((tone) => tone.isRoot)
    expect(roots.length).toBeGreaterThan(0)
    roots.forEach((tone) => {
      expect(tone.pitchClass).toBe(0)
      expect(tone.interval).toBe('R')
    })
  })

  it('maps C, E and G to R, 3 and 5', () => {
    const tones = getFretboardChordTones(0, 'major')
    const roles = new Map(tones.map((tone) => [tone.pitchClass, tone.interval]))
    expect(roles.get(0)).toBe('R')
    expect(roles.get(4)).toBe('3')
    expect(roles.get(7)).toBe('5')
  })

  it('repeats the same pitch class twelve frets higher', () => {
    for (let string = 1; string <= 6; string += 1) {
      expect(getFretboardNote(string, 0).pitchClass).toBe(getFretboardNote(string, 12).pitchClass)
    }
  })
})
