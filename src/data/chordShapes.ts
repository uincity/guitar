import type { ChordShape } from '../types/chord'

export const MOVABLE_CHORD_SHAPES: ChordShape[] = [
  { id: 'e-major', name: 'E Shape', family: 'e-shape', quality: 'major', baseRoot: 4, rootString: 6, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 3, 4, 2, 0, 0], movable: true },
  { id: 'e-minor', name: 'E Shape', family: 'e-shape', quality: 'minor', baseRoot: 4, rootString: 6, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 3, 4, 0, 0, 0], movable: true },
  { id: 'e-7', name: 'E Shape', family: 'e-shape', quality: '7', baseRoot: 4, rootString: 6, frets: [0, 2, 0, 1, 0, 0], fingers: [0, 3, 0, 2, 0, 0], movable: true },
  { id: 'e-maj7', name: 'E Shape', family: 'e-shape', quality: 'maj7', baseRoot: 4, rootString: 6, frets: [0, 2, 1, 1, 0, 0], fingers: [0, 4, 2, 3, 0, 0], movable: true },
  { id: 'e-m7', name: 'E Shape', family: 'e-shape', quality: 'm7', baseRoot: 4, rootString: 6, frets: [0, 2, 0, 0, 0, 0], fingers: [0, 3, 0, 0, 0, 0], movable: true },
  { id: 'a-major', name: 'A Shape', family: 'a-shape', quality: 'major', baseRoot: 9, rootString: 5, frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 2, 3, 4, 0], movable: true },
  { id: 'a-minor', name: 'A Shape', family: 'a-shape', quality: 'minor', baseRoot: 9, rootString: 5, frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 3, 4, 2, 0], movable: true },
  { id: 'a-7', name: 'A Shape', family: 'a-shape', quality: '7', baseRoot: 9, rootString: 5, frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], movable: true },
  { id: 'a-maj7', name: 'A Shape', family: 'a-shape', quality: 'maj7', baseRoot: 9, rootString: 5, frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 3, 2, 4, 0], movable: true },
  { id: 'a-m7', name: 'A Shape', family: 'a-shape', quality: 'm7', baseRoot: 9, rootString: 5, frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 3, 0, 2, 0], movable: true },
]
