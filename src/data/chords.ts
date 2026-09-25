import type { ChordType, GuitarChord, NoteName } from '../types/chord'
import { validateChord } from '../utils/chordUtils'

type Shape = [number[], number[], GuitarChord['barre']?]
const shapes: Record<NoteName, Record<ChordType, Shape>> = {
  C: {
    major: [[-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]],
    minor: [[-1, 3, 5, 5, 4, 3], [0, 1, 3, 4, 2, 1], { fret: 3, fromString: 5, toString: 1, finger: 1 }],
    '7': [[-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]],
    maj7: [[-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]],
    m7: [[-1, 3, 5, 3, 4, 3], [0, 1, 3, 1, 2, 1], { fret: 3, fromString: 5, toString: 1, finger: 1 }],
  },
  D: {
    major: [[-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]],
    minor: [[-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]],
    '7': [[-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]],
    maj7: [[-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 1, 1], { fret: 2, fromString: 3, toString: 1, finger: 1 }],
    m7: [[-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]],
  },
  E: {
    major: [[0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]],
    minor: [[0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]],
    '7': [[0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]],
    maj7: [[0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0]],
    m7: [[0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]],
  },
  F: {
    major: [[1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], { fret: 1, fromString: 6, toString: 1, finger: 1 }],
    minor: [[1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], { fret: 1, fromString: 6, toString: 1, finger: 1 }],
    '7': [[1, 3, 1, 2, 1, 1], [1, 3, 1, 2, 1, 1], { fret: 1, fromString: 6, toString: 1, finger: 1 }],
    maj7: [[-1, -1, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]],
    m7: [[1, 3, 1, 1, 1, 1], [1, 3, 1, 1, 1, 1], { fret: 1, fromString: 6, toString: 1, finger: 1 }],
  },
  G: {
    major: [[3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]],
    minor: [[3, 5, 5, 3, 3, 3], [1, 3, 4, 1, 1, 1], { fret: 3, fromString: 6, toString: 1, finger: 1 }],
    '7': [[3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]],
    maj7: [[3, 2, 0, 0, 0, 2], [3, 1, 0, 0, 0, 2]],
    m7: [[3, 5, 3, 3, 3, 3], [1, 3, 1, 1, 1, 1], { fret: 3, fromString: 6, toString: 1, finger: 1 }],
  },
  A: {
    major: [[-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]],
    minor: [[-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]],
    '7': [[-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]],
    maj7: [[-1, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]],
    m7: [[-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]],
  },
  B: {
    major: [[-1, 2, 4, 4, 4, 2], [0, 1, 3, 3, 3, 1], { fret: 2, fromString: 5, toString: 1, finger: 1 }],
    minor: [[-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1], { fret: 2, fromString: 5, toString: 1, finger: 1 }],
    '7': [[-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]],
    maj7: [[-1, 2, 4, 3, 4, 2], [0, 1, 3, 2, 4, 1], { fret: 2, fromString: 5, toString: 1, finger: 1 }],
    m7: [[-1, 2, 4, 2, 3, 2], [0, 1, 3, 1, 2, 1], { fret: 2, fromString: 5, toString: 1, finger: 1 }],
  },
}

const suffix: Record<ChordType, string> = { major: '', minor: 'm', '7': '7', maj7: 'maj7', m7: 'm7' }
const typeName: Record<ChordType, string> = { major: 'Major', minor: 'Minor', '7': 'Dominant 7', maj7: 'Major 7', m7: 'Minor 7' }

export const chords: GuitarChord[] = Object.entries(shapes).flatMap(([root, types]) =>
  Object.entries(types).map(([type, [frets, fingers, barre]]) => ({
    id: `${root}-${type}`,
    root: root as NoteName,
    type: type as ChordType,
    symbol: `${root}${suffix[type as ChordType]}`,
    name: `${root} ${typeName[type as ChordType]}`,
    frets,
    fingers,
    barre: barre ?? null,
  })),
)

chords.forEach(validateChord)
