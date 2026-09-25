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
- CAGED 학습 모드와 0–15프렛 전체 코드톤 지도
- Root Map, Interval Map, Theory/Playable Voicing 비교
- CAGED Shape별 재생과 순차 비교 재생

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

## CAGED System

CAGED 모드는 하나의 Major Chord를 지판 전체의 다섯 연결된 형태로 학습하게 합니다.

```text
C Shape → A Shape → G Shape → E Shape → D Shape → 반복
```

예를 들어 C Major는 다음 위치로 자동 생성됩니다.

```text
C Shape  X 3 2 0 1 0
A Shape  X 3 5 5 5 3
G Shape  8 7 5 5 5 8
E Shape  8 10 10 9 8 8
D Shape  X X 10 12 13 12
```

위 결과들은 C Major 전용 데이터가 아닙니다. [cagedShapes.ts](src/data/cagedShapes.ts)의 다섯 Open Shape Template을 선택한 Pitch Class까지 이동해 생성합니다. 같은 엔진으로 12개 Major Root의 60개 CAGED 위치를 생성합니다.

### CAGED 학습 화면

- **개별 Shape:** 선택 위치의 운지, 바레, 실제 연주음을 기존 SVG 지판으로 확인합니다.
- **전체 지판:** 모바일에서는 가로로 스크롤 가능한 0–15프렛 지도를 표시합니다.
- **지판 순서/CAGED 순서:** 실제 프렛 위치순과 개념적인 C-A-G-E-D 순서를 전환합니다.
- **음이름/인터벌:** `C · E · G`와 `R · 3 · 5` 표시를 전환합니다.
- **모두 듣기:** 다섯 Shape를 C-A-G-E-D 순서로 1초 간격 재생합니다.

## How CAGED Positions Are Generated

각 Template은 `baseRoot`, 6→1번 현 프렛 배열, 손가락, Root 현을 갖습니다. `generateCagedPositions()`는 다음을 계산합니다.

1. 목표 Root와 기준 Root의 반음 차이를 계산합니다.
2. 뮤트 `-1`을 제외한 모든 프렛을 이동합니다.
3. 0프렛이 이동한 현에 필요한 바레를 생성합니다.
4. 0–15프렛 범위에서 적절한 옥타브 위치를 선택합니다.
5. Root 위치, 실제 MIDI 음, 음이름, 난이도와 프렛 범위를 계산합니다.
6. 모든 음이 R/3/5 중 하나이며 세 구성음이 완전한지 검증합니다.

핵심 구현은 [cagedGenerator.ts](src/music/cagedGenerator.ts)에 있고, 코드별 60개 프렛 배열을 직접 저장하지 않습니다.

## Theory Shape vs Playable Voicing

- **Theory Shape:** Open Shape가 이동한 전체 구조를 보여주어 CAGED 연결 관계를 학습합니다.
- **Playable Voicing:** 전체 운지가 어려운 C/G/D Shape에서 실전에 적합한 상위 3–4현 Triad를 제공합니다.

두 형식 모두 Root, Major 3rd, Perfect 5th를 포함하도록 자동 검증됩니다. A/E Shape는 일반적인 바레 운지가 실전형으로도 사용됩니다.

## Root Map

`Root 찾기` 단계는 전체 지판에서 선택 Root만 표시합니다. 예를 들어 C를 선택하면 여섯 현의 0–15프렛 중 Pitch Class가 C인 위치만 나타납니다. 12프렛 위에서 같은 Pitch Class가 반복되는 것도 확인할 수 있습니다.

## Interval Map

`코드톤` 단계는 현재 Major Chord의 모든 구성음을 표시합니다. 인터벌 모드에서는 Root를 `R`, Major 3rd를 `3`, Perfect 5th를 `5`로 표시하며 Root는 더 굵은 외곽선과 색상, 문자로 함께 구별합니다.

## Adding Partial Voicings

[cagedPartialVoicings.ts](src/data/cagedPartialVoicings.ts)에 사용할 현을 지정합니다. 프렛을 다시 입력하지 않고 부모 CAGED Template에서 필요한 현만 추출합니다.

```ts
{
  id: 'caged-g-top4',
  parentShape: 'G',
  strings: [4, 3, 2, 1],
  label: '상위 4현',
  difficulty: 'Medium',
}
```

생성된 Partial Voicing도 R/3/5 완전성, Root 포함 여부와 코드 외 음 포함 여부를 검사합니다.

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
  components/  선택기, Voicing, SVG 지판, CAGED 학습 UI
  data/        공식, Open/Movable/CAGED Shape, Partial Voicing, 튜닝
  music/       Pitch Class, Spelling, 전조, CAGED/지도 생성과 점수화
  types/       음악 및 코드 모델
  utils/       MIDI와 실제 연주음 계산
```

## Phase 2

Capo, 추가 코드 Quality, CAGED 대체 Shape, 코드 진행, BPM/스트러밍 패턴, 아르페지오, 커스텀 튜닝, Drop D/DADGAD, 우쿨렐레, 왼손 모드, PWA와 즐겨찾기를 현재 엔진 위에 확장할 수 있습니다.
