# Guitar Chord Player

GitHub Pages에서 서버 없이 실행되는 모바일 친화적 기타 코드 학습 도구입니다. 코드를 선택해 SVG 운지를 확인하고, 각 현 또는 전체 스트로크를 Web Audio API로 들어볼 수 있습니다.

## Features

- C–B의 7개 루트와 Major, Minor, 7, Maj7, m7 조합 35개
- 반응형 SVG 지판, 손가락 번호, 바레, 개방현/뮤트 표시
- 표준 튜닝과 프렛으로 실제 음 이름·옥타브·주파수 자동 계산
- 개별 현, Down/Up 스트로크 재생과 재생 중 현 애니메이션
- 키보드 접근성, 다크 모드, 모바일 터치 대응
- 별도 서버·DB·API 키가 필요 없는 완전한 정적 앱

## Tech Stack

React, TypeScript, Vite, SVG, Web Audio API, Vitest, React Testing Library

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`vite.config.ts`의 `base: './'` 설정으로 GitHub Pages의 프로젝트 하위 경로에서도 에셋을 불러옵니다.

## Test

```bash
npm run test
npm run test:run
```

## GitHub Pages Deployment

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정하세요. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 테스트와 빌드를 수행한 뒤 자동 배포합니다.

수동 배포가 필요하면 `npm run build` 후 생성되는 `dist/` 폴더를 정적 호스팅에 올리면 됩니다.

## Chord Data Structure

모든 코드는 `src/data/chords.ts`에 있으며 배열은 `[6번 줄, 5번 줄, 4번 줄, 3번 줄, 2번 줄, 1번 줄]` 순서입니다. `-1`은 뮤트, `0`은 개방현, 양수는 프렛입니다. `fingers`는 `0`(손가락 없음)부터 `4`(소지)까지 사용합니다.

## Adding New Chords

`src/types/chord.ts`의 `NoteName`/`ChordType`을 확장하고 `src/data/chords.ts`의 `shapes`에 6개 frets와 fingers 값을 추가하세요. 개발 시 데이터 검증기가 잘못된 길이와 범위를 즉시 알려줍니다.

## Adding Guitar Samples

현재는 `SynthAudioEngine`이 Web Audio API로 소리를 합성합니다. 실제 샘플을 사용하려면 라이선스가 명확한 파일을 `public/audio/guitar/`에 두고 `SampleAudioEngine`에서 필요할 때만 불러오세요. 파일이 없거나 로드에 실패할 때는 `SynthAudioEngine`으로 fallback하도록 설계되어 있습니다.

## Project Structure

```text
src/
  audio/       AudioEngine 인터페이스와 합성/샘플 엔진
  components/  선택기, SVG 지판, 컨트롤, 정보 패널
  data/        35개 코드 데이터
  styles/      전역 반응형 스타일과 테마
  types/       코드와 음 타입
  utils/       음악 이론 계산과 데이터 검증
```

## Phase 2 Ideas

Capo, 대체 보이싱, 왼손 모드, 아르페지오/BPM, 코드 진행, 스트러밍 패턴, 즐겨찾기, PWA, 샵/플랫 코드, 커스텀 튜닝과 우쿨렐레 지원을 현재 데이터·오디오 계층 위에 확장할 수 있습니다.
