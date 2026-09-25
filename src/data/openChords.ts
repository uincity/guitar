import type { ChordQuality, ChordShape } from '../types/chord'
import type { PitchClass } from '../types/music'

const open = (id: string, name: string, baseRoot: PitchClass, quality: ChordQuality, frets: number[], fingers: number[]): ChordShape => ({
  id, name, family: 'open', quality, baseRoot, rootString: frets[0] >= 0 ? 6 : 5,
  frets, fingers, movable: false, barre: null, commonness: 10,
})

export const OPEN_CHORDS: ChordShape[] = [
  open('open-c', 'Open C', 0, 'major', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
  open('open-d', 'Open D', 2, 'major', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),
  open('open-e', 'Open E', 4, 'major', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
  open('open-g', 'Open G', 7, 'major', [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]),
  open('open-a', 'Open A', 9, 'major', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]),
  open('open-dm', 'Open Dm', 2, 'minor', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]),
  open('open-em', 'Open Em', 4, 'minor', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),
  open('open-am', 'Open Am', 9, 'minor', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]),
  open('open-c7', 'Open C7', 0, '7', [-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]),
  open('open-d7', 'Open D7', 2, '7', [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]),
  open('open-e7', 'Open E7', 4, '7', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
  open('open-g7', 'Open G7', 7, '7', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),
  open('open-a7', 'Open A7', 9, '7', [-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]),
  open('open-b7', 'Open B7', 11, '7', [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]),
  open('open-cmaj7', 'Open Cmaj7', 0, 'maj7', [-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]),
  open('open-dmaj7', 'Open Dmaj7', 2, 'maj7', [-1, -1, 0, 2, 2, 2], [0, 0, 0, 1, 1, 1]),
  open('open-emaj7', 'Open Emaj7', 4, 'maj7', [0, 2, 1, 1, 0, 0], [0, 3, 1, 2, 0, 0]),
  open('open-amaj7', 'Open Amaj7', 9, 'maj7', [-1, 0, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]),
  open('open-dm7', 'Open Dm7', 2, 'm7', [-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]),
  open('open-em7', 'Open Em7', 4, 'm7', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]),
  open('open-am7', 'Open Am7', 9, 'm7', [-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]),
]
