import type { CagedShapeTemplate } from '../types/caged'

export const CAGED_SHAPES: CagedShapeTemplate[] = [
  {
    id: 'caged-c', shape: 'C', baseRoot: 0, quality: 'major', movable: true,
    frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 4, 3, 0, 2, 0], rootStrings: [5, 2],
    description: 'Open C 코드 모양을 이동한 형태입니다. 구조 학습에 유용하며 높은 위치에서는 부분 운지가 편리합니다.',
  },
  {
    id: 'caged-a', shape: 'A', baseRoot: 9, quality: 'major', movable: true,
    frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 2, 3, 4, 0], rootStrings: [5, 3],
    description: 'Open A 코드 모양을 이동한 5번 현 Root 바레 형태입니다.',
  },
  {
    id: 'caged-g', shape: 'G', baseRoot: 7, quality: 'major', movable: true,
    frets: [3, 2, 0, 0, 0, 3], fingers: [4, 3, 0, 0, 0, 4], rootStrings: [6, 3, 1],
    description: 'Open G 코드 모양을 이동합니다. 전체 Shape는 구조 이해에 좋고 실제 연주에서는 부분 운지가 자주 쓰입니다.',
  },
  {
    id: 'caged-e', shape: 'E', baseRoot: 4, quality: 'major', movable: true,
    frets: [0, 2, 2, 1, 0, 0], fingers: [0, 3, 4, 2, 0, 0], rootStrings: [6, 4, 1],
    description: 'Open E 코드 모양을 이동한 대표적인 6현 바레 형태입니다.',
  },
  {
    id: 'caged-d', shape: 'D', baseRoot: 2, quality: 'major', movable: true,
    frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], rootStrings: [4, 2],
    description: 'Open D 코드 모양을 이동한 고음역 형태입니다. 상위 3현 Triad로 간결하게 연주할 수 있습니다.',
  },
]
