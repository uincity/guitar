# Guitar Chord Player

12음계, 이명동음, Open Chord와 이동형 E/A Shape를 결합해 운지를 자동 생성하는 모바일 친화적 기타 코드 플레이어입니다. GitHub Pages에서 별도 서버 없이 실행됩니다.

## Features

- C부터 B까지 12개 Pitch Class
- Auto, Flat, Sharp 음이름 표시 전환
- Major, Minor, 7, Maj7, m7 코드
- 21개 Open Chord와 10개 재사용 가능한 Movable Shape
- E/A Shape 전조, 뮤트 현 보존과 바레 자동 생성
- Open Chord와 낮은 프렛을 우선하는 Voicing 점수화
- 코드마다 여러 Voicing 탐색
- 음계 문자 역할을 고려한 Enharmonic Spelling
- 고음역 코드에 맞춰 이동하는 SVG 프렛 창
- MIDI 기반 실제 연주음과 주파수 계산
- 개별 현, Down/Up 스트로크 Web Audio 재생
- 모바일 레이아웃, 키보드 접근성, 다크 모드

## Architecture

코드 이름, 실제 Pitch Class, 기타 운지는 서로 분리됩니다.

```text
Pitch Class / Chord Formula     Open / E / A Shapes
              \                    /
               Chord & Voicing Generator
                    /     |      \
                  SVG   Audio   Info Panel
```

`src/music/`은 표기와 운지 생성만 담당하며 React나 SVG를 참조하지 않습니다. `src/audio/`도 UI와 독립된 인터페이스로 구성되어 있습니다.

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

`vite.config.ts`의 상대 `base` 설정으로 GitHub Pages 프로젝트 하위 경로에서도 에셋을 정상적으로 불러옵니다.

## Test

```bash
npm run test
npm run test:run
```

Pitch Class alias, MIDI, Enharmonic Spelling, E/A Shape 전조, 바레 생성, Voicing 우선순위, 실제 연주음과 UI 전환을 검증합니다.

## 12 Chromatic Roots and Enharmonic Notes

내부에서는 음을 0~11 Pitch Class로 저장합니다. 따라서 `C#`와 `Db`는 같은 값 `1`이며 실제 MIDI와 운지도 같습니다. 화면 표기만 사용자의 Auto/Flat/Sharp 설정에 따라 바뀝니다.

예를 들어 동일한 `244322` 운지는 다음처럼 표시됩니다.

- Flat: `Gb Major` — `Gb · Bb · Db`
- Sharp: `F# Major` — `F# · A# · C#`

## Open Chords

`src/data/openChords.ts`에는 이동하지 않는 일반적인 Open Voicing 21개가 등록되어 있습니다. Open Chord가 존재하면 기본 Voicing으로 우선 선택됩니다. Open C의 `X32010`을 Db로 단순 이동시키지 않습니다.

## Movable Shapes and Barre Chords

`src/data/chordShapes.ts`에는 각 Quality별 E Shape와 A Shape가 있습니다. Shape의 `baseRoot`와 목표 Pitch Class 차이로 모든 프렛을 이동합니다. 이때 `-1`은 항상 뮤트로 남고, 0프렛은 이동 후 바레 프렛이 됩니다.

예시:

```text
E Major  0 2 2 1 0 0
F Major  1 3 3 2 1 1
Ab Major 4 6 6 5 4 4

A Major  X 0 2 2 2 0
Bb Major X 1 3 3 3 1
Db Major X 4 6 6 6 4
```

## Adding a New Shape

`src/data/chordShapes.ts`에 `ChordShape` 객체를 추가합니다.

```ts
{
  id: 'e-sus4',
  name: 'E Shape',
  family: 'e-shape',
  quality: 'sus4',
  baseRoot: 4,
  rootString: 6,
  frets: [0, 2, 2, 2, 0, 0],
  fingers: [0, 2, 3, 4, 0, 0],
  movable: true,
}
```

새 Quality라면 `src/types/chord.ts`의 타입과 `src/data/chordFormulas.ts`의 interval/degrees/suffix도 함께 추가합니다. 개별 루트마다 운지를 복제할 필요는 없습니다.

## Audio Playback

샘플 없이도 `SynthAudioEngine`이 Web Audio API로 동작합니다. 실제 기타 샘플을 추가하려면 라이선스가 명확한 파일을 `public/audio/guitar/`에 두고 `SampleAudioEngine`에서 필요할 때 불러오세요. 샘플 로드 실패 시 Synth로 fallback할 수 있는 구조입니다.

## GitHub Pages

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 지정하세요. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 다음 과정을 실행합니다.

```text
npm ci
npm run test:run
npm run build
deploy
```

## Project Structure

```text
src/
  audio/       오디오 인터페이스와 Synth/Sample 엔진
  components/  선택기, Voicing, SVG 지판, 정보 패널
  data/        공식, Open Chord, Movable Shape, 튜닝
  music/       Pitch Class, Spelling, 전조, 생성과 점수화
  types/       음악 및 코드 모델
  utils/       MIDI와 실제 연주음 계산
```

## Phase 2

Capo, 추가 코드 Quality, CAGED 대체 Shape, 코드 진행, BPM/스트러밍 패턴, 아르페지오, 커스텀 튜닝, Drop D/DADGAD, 우쿨렐레, 왼손 모드, PWA와 즐겨찾기를 현재 엔진 위에 확장할 수 있습니다.
