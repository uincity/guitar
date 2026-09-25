import type { PartialVoicingTemplate } from '../types/caged'

export const CAGED_PARTIAL_VOICINGS: PartialVoicingTemplate[] = [
  { id: 'caged-c-top4', parentShape: 'C', strings: [4, 3, 2, 1], label: '상위 4현', difficulty: 'Medium' },
  { id: 'caged-g-top4', parentShape: 'G', strings: [4, 3, 2, 1], label: '상위 4현', difficulty: 'Medium' },
  { id: 'caged-d-top3', parentShape: 'D', strings: [3, 2, 1], label: '상위 3현 Triad', difficulty: 'Easy' },
]
