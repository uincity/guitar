# Codex 통합 프롬프트 — FreePats Nylon Guitar WAV 적용

## 프로젝트

- Repository: `https://github.com/uincity/guitar`
- 로컬 Repository 경로: `D:\40.Counsel\guitar`
- **FreePats Nylon Guitar 샘플 현재 경로:**  
  `D:\40.Counsel\guitar\src\audio\nylon-guitar`

## 작업 목표

현재 Guitar Chord Player의 Web Audio API 기반 `SynthAudioEngine`은 유지하되,
FreePats의 실제 Nylon/Classical Guitar WAV 샘플을 우선 사용하도록 오디오 엔진을 개선한다.

최종 동작 구조:

```text
Chord / CAGED Voicing
        ↓
String + Fret + MIDI
        ↓
Sample Resolver
        ↓
FreePats Nylon Guitar WAV
        ↓
Web Audio API AudioBuffer
        ↓
실제 기타 음 재생
        ↓
샘플 누락·오류 시 SynthAudioEngine fallback
```

코드 전체가 녹음된 WAV를 사용하는 방식이 아니라,
각 현의 실제 sounding note를 개별 기타 샘플로 재생하여
Open Chord, Barre, Alternative Voicing, CAGED, Capo, Arpeggio 등에
동일한 오디오 엔진을 사용할 수 있도록 한다.

---

# 1. 작업 시작 전 Repository 감사

먼저 `D:\40.Counsel\guitar` 전체 구조를 확인한다.

특히 다음을 확인한다.

- `package.json`
- `vite.config.*`
- `src/audio/`
- 현재 `AudioEngine`
- `SynthAudioEngine`
- 기존 `SampleAudioEngine` 존재 여부
- MIDI 계산 utility
- Chord sounding notes 계산
- String / Fret 정보 구조
- Down Stroke
- Up Stroke
- CAGED 관련 Audio 처리
- GitHub Pages deployment workflow
- 기존 tests

관련 없는 기능이나 파일은 수정하지 않는다.

기존 Guitar Chord / CAGED 기능을 손상시키지 않는다.

---

# 2. 샘플 파일 실제 위치

현재 FreePats 샘플은 다음 경로에 있다.

```text
D:\40.Counsel\guitar\src\audio\nylon-guitar
```

상대 경로:

```text
src/audio/nylon-guitar
```

이 디렉터리를 **실제 샘플 원본 위치(source of truth)** 로 사용한다.

작업 전에 해당 폴더를 재귀적으로 조사하여 다음을 보고한다.

- WAV 파일 수
- SFZ 파일 수
- README / LICENSE / COPYING 파일
- 하위 directory 구조
- WAV 총 용량
- SFZ가 참조하는 sample path 구조

WAV 또는 SFZ 파일명을 추측하지 말고 실제 파일을 확인한다.

---

# 3. 중요한 경로 정책

샘플이 현재 `src/audio/nylon-guitar` 아래에 있으므로
무조건 `public/`으로 이동시키지 않는다.

우선 **Vite의 `import.meta.glob()` 기반 URL import 방식**으로
`src` 내부 샘플을 그대로 build asset으로 포함하는 방식을 사용한다.

권장:

```ts
const sampleModules = import.meta.glob(
  './nylon-guitar/**/*.wav',
  {
    eager: true,
    query: '?url',
    import: 'default'
  }
);
```

실제 상대 경로는 `SampleAudioEngine.ts` 또는 별도 asset registry 파일의
위치에 맞게 정확히 조정한다.

이 방식의 장점:

- 로컬 개발과 GitHub Pages 모두 Vite가 asset URL을 관리
- `/guitar/` base path를 Vite가 자동 반영
- 파일명을 직접 URL에 hard coding할 필요 없음
- build 시 hashed asset URL 사용 가능
- `src/audio/nylon-guitar` 원본 구조 유지 가능

`public/audio/...`로 파일을 중복 복사하지 않는다.

단, 현재 Vite 구성이나 실제 샘플 구조 때문에 `import.meta.glob()` 방식이
명백히 부적합하면 그 이유를 먼저 설명하고,
대안으로 build-time copy 방식을 선택할 수 있다.

그 경우에도 원본
`src/audio/nylon-guitar`
파일은 삭제하거나 rename하지 않는다.

---

# 4. GitHub Pages 대응

Repository는 다음 주소로 배포된다.

```text
https://uincity.github.io/guitar/
```

따라서 `/audio/...` 같은 root absolute URL을 직접 hard coding하지 않는다.

`src` asset import를 사용할 경우
Vite가 생성하는 URL을 그대로 사용한다.

필요한 경우에만:

```ts
import.meta.env.BASE_URL
```

을 사용한다.

다음을 모두 정상 지원해야 한다.

```text
npm run dev
npm run build
GitHub Pages /guitar/
```

---

# 5. WAV 파일명 변경 금지

다음 작업은 하지 않는다.

```text
sample001.wav → E2.wav
sample002.wav → F2.wav
```

FreePats 원본 WAV 파일명은 그대로 유지한다.

SFZ가 WAV를 filename으로 참조할 수 있기 때문이다.

폴더 구조도 가능하면 원본을 유지한다.

---

# 6. SFZ 우선 분석

`src/audio/nylon-guitar` 내부에 `.sfz`가 존재한다면
WAV 파일명으로 음높이를 추측하지 않는다.

SFZ를 우선 분석한다.

최소 다음 opcode를 확인한다.

```text
sample
key
pitch_keycenter
lokey
hikey
lovel
hivel
volume
tune
offset
ampeg_attack
ampeg_decay
ampeg_sustain
ampeg_release
```

특히 중요한 정보:

```text
sample
key
pitch_keycenter
lokey
hikey
lovel
hivel
```

---

# 7. SFZ Parser 범위

범용 SFZ Player 전체를 구현하지 않는다.

이번 프로젝트에서 필요한 최소 기능만 처리한다.

목표:

```text
Target MIDI
   ↓
적절한 FreePats WAV
   ↓
Root MIDI
   ↓
Playback Rate
```

SFZ의 `<group>` 설정이 `<region>`에 상속되는 경우
현재 FreePats 파일에서 실제 사용하는 opcode만 정확히 상속 처리한다.

---

# 8. Runtime SFZ Parsing 최소화

브라우저 실행 시 SFZ 파일을 매번 parsing하지 않는 것이 좋다.

가능하면 build/development 단계에서 manifest를 생성한다.

예:

```text
scripts/build-guitar-sample-map.mjs
```

입력:

```text
src/audio/nylon-guitar/**/*.sfz
```

출력 예:

```text
src/audio/nylon-guitar/sample-map.generated.json
```

또는:

```text
src/data/nylonGuitarSamples.generated.ts
```

생성 파일은 실제 프로젝트 구조에 가장 자연스러운 쪽을 선택한다.

---

# 9. Manifest 구조

예:

```ts
export interface GuitarSampleDefinition {
  fileKey: string;
  rootMidi: number;
  lowMidi?: number;
  highMidi?: number;
  velocityMin?: number;
  velocityMax?: number;
  volumeDb?: number;
  tuneCents?: number;
}
```

예시 데이터는 실제 값으로 가정하지 않는다.

반드시 SFZ에서 추출한다.

---

# 10. Asset Registry

Vite가 실제 WAV URL을 build 시 처리할 수 있도록
별도 registry를 만든다.

예:

```text
src/audio/nylonGuitarAssetRegistry.ts
```

개념:

```ts
const wavAssets = import.meta.glob(
  './nylon-guitar/**/*.wav',
  {
    eager: true,
    query: '?url',
    import: 'default'
  }
);
```

manifest의 `fileKey`와
glob 결과의 실제 file path를 연결한다.

Windows path separator `\`와
Web/Vite path separator `/` 차이를 반드시 정규화한다.

예:

```ts
normalizeSamplePath()
```

를 만든다.

---

# 11. Sample Resolver

새 파일 또는 기존 파일 확장:

```text
src/audio/sampleResolver.ts
```

최소 함수:

```ts
findExactSample()
findNearestSample()
selectVelocityLayer()
getPlaybackRate()
resolveGuitarSample()
normalizeSamplePath()
```

예:

```ts
resolveGuitarSample({
  midi,
  velocity,
  string,
  fret
})
```

반환:

```ts
{
  url,
  rootMidi,
  targetMidi,
  playbackRate,
  velocityLayer,
  sourceFile
}
```

---

# 12. Exact Sample 우선

우선순위:

1. target MIDI에 직접 매핑되는 region
2. target MIDI를 range로 포함하는 SFZ region
3. 가까운 root sample
4. SynthAudioEngine fallback

단순히 filename 순서로 선택하지 않는다.

---

# 13. Pitch Shift

샘플이 모든 반음을 개별 WAV로 제공하지 않아도 된다.

계산:

```ts
const semitones = targetMidi - rootMidi;
const playbackRate = 2 ** (semitones / 12);
```

예:

```text
root MIDI 40
target MIDI 42

playbackRate = 2 ** (2 / 12)
```

---

# 14. Pitch Shift 허용 범위

SFZ의 `lokey` / `hikey`가 있다면 해당 범위를 우선한다.

그 범위 정보가 없다면 기본적으로 가까운 sample을 사용하되
지나친 pitch shifting을 피한다.

fallback heuristic 예:

```text
Exact
±1
±2
±3 semitone
그 이상 → Synth fallback
```

단 실제 FreePats SFZ가 더 넓은 key range를 명시한다면
그 공식 mapping을 우선한다.

---

# 15. SampleAudioEngine

다음 파일을 구현하거나 기존 클래스를 확장한다.

```text
src/audio/SampleAudioEngine.ts
```

기존 `AudioEngine` interface를 최대한 유지한다.

필요하면 다음 형태로 확장한다.

```ts
playNote({
  midi,
  velocity,
  duration,
  string,
  fret
})

playChord(...)
stopAll()
resume()
preloadNotes(...)
```

---

# 16. AudioBuffer 기반 재생

매번 `new Audio()`를 생성하지 않는다.

Web Audio API 사용:

```text
WAV URL
↓
fetch()
↓
ArrayBuffer
↓
decodeAudioData()
↓
AudioBuffer
↓
AudioBufferSourceNode
↓
GainNode
↓
destination
```

---

# 17. AudioBuffer Cache

동일 WAV를 반복 다운로드/Decode하지 않는다.

예:

```ts
Map<string, Promise<AudioBuffer>>
```

또는:

```ts
Map<string, AudioBuffer>
```

동시 요청 시 같은 WAV를 중복 fetch하지 않도록
Promise cache 방식도 고려한다.

---

# 18. Lazy Loading

페이지 진입 시 FreePats 전체 WAV를 다운로드하지 않는다.

샘플은 필요한 시점에만 fetch/decode한다.

예:

C Major:

```text
X 3 2 0 1 0
```

필요한 실제 sounding MIDI만 preload 또는 load한다.

---

# 19. 선택 코드 Preload

사용자가 코드를 선택하면
현재 코드에 필요한 sample을 background preload할 수 있다.

예:

```ts
preloadNotes(midiNotes)
```

UI interaction을 막지 않는다.

전체 guitar library preload는 하지 않는다.

---

# 20. 기존 SynthAudioEngine 유지

기존:

```text
SynthAudioEngine
```

을 삭제하지 않는다.

최종 구조:

```text
Hybrid / Preferred Sample Engine

SampleAudioEngine
        ↓
Sample resolve 성공
        ↓
실제 Guitar WAV

Sample resolve 실패
        ↓
SynthAudioEngine
```

---

# 21. Fallback 정책

가능하면 note 단위 fallback을 지원한다.

예:

```text
C3 → sample
E3 → sample
G3 → sample missing → synth
C4 → sample
E4 → sample
```

다만 실제 코드에서 sample + synth 혼합음이 지나치게 부자연스럽다면
현재 architecture에 맞게 chord 전체 fallback을 적용해도 된다.

선택 이유를 작업 결과에 기록한다.

---

# 22. String / Fret 정보 유지

API에서 다음 정보를 버리지 않는다.

```ts
{
  midi,
  string,
  fret
}
```

현재는 MIDI 중심 sample resolving을 사용하더라도
향후 string-aware sample을 적용할 수 있도록 한다.

같은 MIDI 음도 기타에서는:

```text
1번현 개방
2번현 5 fret
3번현 9 fret
```

처럼 timbre가 다를 수 있기 때문이다.

---

# 23. 현재 단계의 우선순위

Phase 1:

```text
MIDI Pitch 기반 실제 Nylon Guitar Sample
```

Phase 2 확장 가능성:

```text
String-aware samples
Velocity layers
Round robin
Articulation
```

현재 FreePats 데이터에 없는 정보를 임의로 만들어내지 않는다.

---

# 24. Velocity Layer

SFZ에 `lovel`, `hivel`이 존재하면 활용한다.

입력 velocity:

```text
0.0 ~ 1.0
```

을 MIDI velocity:

```text
1 ~ 127
```

범위로 매핑해 적절한 layer를 고른다.

velocity layer가 없는 라이브러리도 정상 동작해야 한다.

---

# 25. Round Robin

동일 key/velocity에 여러 실제 sample이 존재한다면
구조적으로 round-robin을 지원할 수 있다.

하지만 이번 Phase의 필수 기능은 아니다.

무리한 randomization보다 안정적 sample 재생을 우선한다.

---

# 26. Gain / Envelope

원본 Nylon Guitar WAV의 attack과 natural decay를 최대한 보존한다.

Synth처럼 강한 envelope를 덧씌우지 않는다.

필요한 경우에만:

- 아주 짧은 fade-in
- stop 시 fade-out
- Gain normalize

를 사용한다.

---

# 27. Down Stroke

기존 Down Stroke 동작을 유지한다.

연주 가능한 가장 낮은 현에서 높은 현 방향으로 순차 재생한다.

Muted string은 skip한다.

기본 delay:

```text
약 45ms
```

필요하면 미세한 humanization을 적용한다.

---

# 28. Up Stroke

높은 현에서 낮은 현 방향으로 재생한다.

Muted string skip.

기존 로직과 regression이 없어야 한다.

---

# 29. Humanization

실제 기타처럼 들리게 하기 위해
아주 작은 timing/velocity 차이를 줄 수 있다.

권장 범위 예:

```text
string delay: 약 38~52ms
velocity: 약 0.82~0.95
```

그러나 테스트가 매번 달라지는 완전 random 구조는 피한다.

가능하면 deterministic humanization을 사용한다.

---

# 30. 코드 전체 WAV 사용 금지

다음 방식은 사용하지 않는다.

```text
C-major.wav
Am.wav
F-major.wav
```

코드는 개별 현을 각각 재생해야 한다.

이 원칙을 지켜야 다음 기능과 자연스럽게 연동된다.

- CAGED
- Barre
- Alternative Voicing
- Capo
- Arpeggio
- Chord Progression
- Custom Tuning

---

# 31. CAGED 연동

기존 CAGED 기능도 동일 `SampleAudioEngine`을 사용한다.

예:

```text
C Major Open C Shape
X32010
```

와:

```text
C Major E Shape
8 10 10 9 8 8
```

는 같은 chord tone이지만 실제 sounding octave/voicing이 다르다.

각 CAGED shape의 실제 MIDI를 그대로 sample engine에 전달한다.

---

# 32. 개별 String 클릭

Fretboard에서 특정 현을 클릭하면
현재 String/Fret의 실제 MIDI 음을 sample로 재생한다.

예:

```text
C Major
5번현 3 fret
→ C3
→ FreePats sample
```

---

# 33. CAGED Note Marker 클릭

CAGED long fretboard의 chord tone marker 클릭 시에도
동일 engine을 사용한다.

새 AudioEngine을 별도로 만들지 않는다.

---

# 34. AudioContext

가능하면 App 전체에서 하나의 AudioContext를 재사용한다.

음 하나마다 새 AudioContext를 만들지 않는다.

Safari / iOS 정책 때문에
사용자의 첫 Click/Touch 이후:

```ts
audioContext.resume()
```

처리를 한다.

---

# 35. Safari 대응

최소 다음을 고려한다.

- 최초 user gesture
- `AudioContext.resume()`
- `decodeAudioData()`
- BufferSource 재생
- 빠른 연속 클릭
- stop/replay
- 페이지 background/foreground 복귀

iOS Safari에서 autoplay를 시도하지 않는다.

---

# 36. Loading UX

첫 sample load/decode 시 약간의 지연이 있을 수 있다.

필요하면 Play button 내부에 짧게:

```text
Loading…
```

상태를 표시한다.

전체 화면 spinner는 사용하지 않는다.

---

# 37. 오류 처리

샘플 fetch/decode 실패가 앱 전체 오류가 되어서는 안 된다.

예:

```text
Sample load failed
→ 해당 음 Synth fallback
```

개발 환경에서는 유용한 warning을 남긴다.

production에서는 반복적인 noisy log를 피한다.

---

# 38. 로컬 Windows Path 주의

원본 실제 Windows 경로:

```text
D:\40.Counsel\guitar\src\audio\nylon-guitar
```

코드 안에 이 절대 경로를 runtime path로 hard coding하지 않는다.

이 경로는 Codex가 local files를 찾기 위한 **개발 입력 경로**일 뿐이다.

브라우저 코드에서는 반드시 repository-relative asset/import URL을 사용한다.

---

# 39. SFZ Sample Path 정규화

SFZ에서 다음처럼 path가 나올 수 있다.

```text
Samples\sample.wav
Samples/sample.wav
../Samples/sample.wav
```

이를 Vite glob key와 비교할 수 있도록 정규화한다.

규칙:

- `\` → `/`
- `./` 정리
- redundant separator 정리
- case sensitivity 주의
- URL encode 필요 여부 확인

Windows에서는 동작하지만 GitHub Pages/Linux build에서 깨지는
case mismatch를 반드시 검사한다.

---

# 40. 대소문자 검증

Windows filesystem은 대소문자 문제를 숨길 수 있다.

GitHub Actions/Linux에서는:

```text
Samples/E2.wav
samples/E2.wav
```

가 다른 경로다.

SFZ reference와 실제 file path의 case mismatch를 검사한다.

발견 시 명시적으로 보고한다.

파일을 임의 rename하기 전에는 현재 repository 영향도를 확인한다.

---

# 41. License / Source 확인

`src/audio/nylon-guitar` 안에:

```text
README
LICENSE
COPYING
SFZ metadata
```

등이 있으면 실제 내용을 확인한다.

라이선스를 추측하지 않는다.

필요하면 다음 파일을 추가한다.

```text
src/audio/nylon-guitar/SOURCE.md
```

또는 Repository root의:

```text
THIRD_PARTY_LICENSES.md
```

기존 라이선스 구조에 맞춘다.

---

# 42. Git commit 대상

실제 FreePats WAV를 GitHub Pages에서 배포하려면
WAV asset이 Git repository 또는 build가 접근 가능한 위치에 있어야 한다.

현재 위치:

```text
src/audio/nylon-guitar
```

가 `.gitignore`에 제외되어 있지 않은지 확인한다.

제외되어 있다면 왜 제외되어 있는지 점검하고,
필요한 sample asset이 GitHub Actions build에 포함되도록 조정한다.

다만 큰 binary 파일을 무조건 commit하기 전에 총 용량을 보고한다.

---

# 43. Repository 용량 확인

WAV 전체 크기를 계산한다.

결과 보고:

```text
WAV count:
Total size:
Largest file:
Estimated build asset size:
```

지나치게 크다면 바로 모든 WAV를 commit하지 말고
다음 최적화안을 제안한다.

- 실제 사용하는 샘플만 포함
- lossless/compatible 압축
- 별도 asset hosting
- nearest-sample strategy

하지만 현재 FreePats 패키지가 합리적인 크기라면
GitHub Pages 직접 배포를 우선한다.

---

# 44. 필요한 Sample만 추리는 기능

SFZ 분석 결과,
웹앱에서 사용하지 않는 articulation/sample이 매우 많다면
최소 subset을 만들 수 있는 script를 고려한다.

단 원본 삭제 금지.

예:

```text
scripts/select-guitar-samples.mjs
```

원본:

```text
src/audio/nylon-guitar
```

유지.

필요한 subset을 build에서 사용하도록 할 수 있다.

현재 파일 규모가 작다면 불필요하게 복잡하게 만들지 않는다.

---

# 45. sample manifest build script

가능하면 package.json에 추가:

```json
{
  "scripts": {
    "audio:build-map": "node scripts/build-guitar-sample-map.mjs"
  }
}
```

필요하다면:

```text
npm run audio:build-map
```

후:

```text
npm run build
```

구조로 사용한다.

---

# 46. 자동 build 연동

생성 manifest가 build에 필수라면
다음 중 하나를 선택한다.

### 방법 A
생성 결과를 Git에 commit.

### 방법 B
`prebuild`에서 manifest 자동 생성.

예:

```json
{
  "scripts": {
    "prebuild": "npm run audio:build-map"
  }
}
```

CI 안정성과 개발 편의를 검토해 더 적합한 것을 선택한다.

---

# 47. Test — Sample Resolver

최소 다음을 테스트한다.

## Exact

```text
targetMidi === rootMidi
playbackRate === 1
```

## +1 Semitone

```text
2 ** (1 / 12)
```

## -1 Semitone

```text
2 ** (-1 / 12)
```

## SFZ Range

target MIDI가 `lokey~hikey` 범위에 들어가면
해당 region 선택.

## Velocity Layer

velocity가 적절한 `lovel~hivel` layer 선택.

## Missing

해결 가능한 sample이 없으면 fallback.

---

# 48. Test — Asset Registry

manifest의 모든 사용 sample path가
Vite asset registry에서 실제 URL로 해결되는지 검증한다.

가능하면 build-time validation script를 만든다.

다음 오류를 build 전에 잡아야 한다.

```text
SFZ references WAV that does not exist
Case mismatch
Unsupported path
Duplicate ambiguous mapping
```

---

# 49. Test — MIDI

기존 MIDI 계산 regression:

```text
E2 = 40
A2 = 45
D3 = 50
G3 = 55
B3 = 59
E4 = 64
```

유지.

---

# 50. Test — C Major

Open C:

```text
[-1, 3, 2, 0, 1, 0]
```

Sounding notes:

```text
C3
E3
G3
C4
E4
```

각 MIDI가 Sample Resolver로 전달되는지 확인한다.

---

# 51. Test — CAGED

C Major E Shape:

```text
8 10 10 9 8 8
```

각 sounding MIDI를 계산하고
SampleAudioEngine으로 전달하는지 검증한다.

---

# 52. Regression Tests

기존 모든 tests를 유지한다.

특히:

- Pitch Class
- Enharmonic
- Chord Generator
- Movable Shape
- Barre
- CAGED
- SVG
- Down Stroke
- Up Stroke

새 sample engine 때문에 기존 tests가 깨져서는 안 된다.

---

# 53. Manual Validation — Local

다음 명령을 실행한다.

```bash
npm install
npm run test:run
npm run build
npm run dev
```

로컬 브라우저에서 실제 기타 소리를 확인한다.

---

# 54. Manual Scenario A

C Major 선택.

```text
X32010
```

각 현 클릭.

실제 FreePats Nylon Guitar 음이 들리는지 확인.

---

# 55. Manual Scenario B

C Major Down Stroke.

각 현이 동시에 재생되는 것이 아니라
실제 Strum처럼 순차 재생되는지 확인.

---

# 56. Manual Scenario C

Bb Major 또는 F Major Barre Chord.

실제 MIDI 음과 sample pitch가 맞는지 확인.

---

# 57. Manual Scenario D

CAGED C Major.

Open C와 E Shape를 각각 Play.

동일 C Major라도 음역/voicing 차이가 실제 sample sound에 반영되는지 확인.

---

# 58. Manual Scenario E

샘플 mapping을 일부러 찾을 수 없는 MIDI로 테스트.

SynthAudioEngine fallback이 앱 오류 없이 동작하는지 확인.

---

# 59. Production Build 검증

`npm run build` 후 생성된 `dist`를 확인한다.

실제 WAV asset이 Vite build output에 포함되는지 확인한다.

hashed filename을 사용한다면
JS에서 올바른 URL을 가리키는지 확인한다.

---

# 60. GitHub Pages 검증

배포 주소:

```text
https://uincity.github.io/guitar/
```

확인:

- 앱 정상 로딩
- WAV 404 없음
- C Major 재생
- 개별 String 재생
- CAGED 재생
- Safari/Chrome 동작
- Console error 없음

---

# 61. Network 검증

Browser DevTools Network에서 확인:

- WAV가 필요할 때 lazy load되는가
- 같은 WAV가 반복 fetch되지 않는가
- 404가 없는가
- `/guitar/` base 문제 없는가
- asset URL이 production에서 올바른가

---

# 62. README 업데이트

README에 추가:

## Real Guitar Audio

실제 FreePats Nylon/Classical Guitar WAV sample을 사용한다.

## Local Sample Source

```text
D:\40.Counsel\guitar\src\audio\nylon-guitar
```

단 이 경로는 개발 PC의 local repository 경로이며
runtime에서는 repository-relative Vite asset을 사용한다.

## Rebuild Sample Map

```bash
npm run audio:build-map
```

## Audio Fallback

sample resolve/load 실패 시 `SynthAudioEngine`.

## GitHub Pages

Vite asset URL로 `/guitar/` subpath 지원.

## Third-party License

실제 FreePats package의 license/source 문서 참조.

---

# 63. 권장 최종 구조

실제 repository 상태에 맞게 조정하되
대략 다음 구조를 목표로 한다.

```text
D:\40.Counsel\guitar
│
├─ src
│  ├─ audio
│  │  ├─ AudioEngine.ts
│  │  ├─ SynthAudioEngine.ts
│  │  ├─ SampleAudioEngine.ts
│  │  ├─ sampleResolver.ts
│  │  ├─ nylonGuitarAssetRegistry.ts
│  │  │
│  │  └─ nylon-guitar
│  │      ├─ *.sfz
│  │      ├─ *.wav
│  │      ├─ samples/
│  │      │   └─ *.wav
│  │      ├─ README...
│  │      └─ LICENSE...
│  │
│  └─ ...
│
├─ scripts
│  └─ build-guitar-sample-map.mjs
│
└─ ...
```

실제 FreePats folder hierarchy가 다르면
원본 구조를 우선 유지한다.

---

# 64. 금지사항

다음은 하지 않는다.

- `D:\40.Counsel\...` 절대 경로를 browser runtime 코드에 저장
- WAV 파일명을 임의 변경
- SFZ가 있는데 pitch를 filename으로 추측
- 모든 WAV를 최초 로딩 시 preload
- 한 음마다 AudioContext 새로 생성
- 코드 전체 WAV 파일 사용
- 기존 SynthAudioEngine 삭제
- 기존 CAGED AudioEngine 별도 복제
- `/audio/...` 절대 URL hard coding
- Windows에서는 되지만 Linux/GitHub Actions에서 깨지는 case mismatch 방치
- license 추측
- 관련 없는 파일 대규모 수정

---

# 65. 완료 기준

다음 조건을 모두 충족해야 완료로 판단한다.

- [ ] `D:\40.Counsel\guitar\src\audio\nylon-guitar` 실제 파일 조사
- [ ] WAV/SFZ 파일 구조 보고
- [ ] SFZ 기반 sample mapping
- [ ] Vite asset registry
- [ ] MIDI → Sample Resolver
- [ ] Pitch shift
- [ ] Velocity layer 지원 가능한 구조
- [ ] AudioBuffer cache
- [ ] Lazy loading
- [ ] SampleAudioEngine
- [ ] SynthAudioEngine fallback
- [ ] 개별 String 실제 기타음 재생
- [ ] Down Stroke 실제 기타음 재생
- [ ] Up Stroke 실제 기타음 재생
- [ ] CAGED 실제 기타음 재생
- [ ] Safari AudioContext 대응
- [ ] Windows/Linux path 차이 처리
- [ ] GitHub Pages `/guitar/` 대응
- [ ] WAV 404 없음
- [ ] 기존 regression tests PASS
- [ ] `npm run test:run` PASS
- [ ] `npm run build` SUCCESS
- [ ] License/source 기록

---

# 66. 최종 결과 보고 형식

작업 완료 후 아래 형식으로 보고한다.

## FreePats Nylon Guitar 적용 결과

### 1. 발견한 샘플 구조

Local source:

```text
D:\40.Counsel\guitar\src\audio\nylon-guitar
```

SFZ:
- 파일 수
- 파일명

WAV:
- 총 파일 수
- 총 용량
- MIDI / key range

### 2. SFZ 분석

- Regions
- Velocity layers
- Key ranges
- Sample references
- 발견된 문제

### 3. Asset 처리 방식

예:

```text
src/audio/nylon-guitar
→ import.meta.glob()
→ Vite build asset URL
```

선택 이유 설명.

### 4. SampleAudioEngine

구현 내용.

### 5. Sample Resolver

- Exact
- Range
- Nearest
- Pitch Shift
- Fallback

### 6. 실제 기타 재생

- Individual String
- Down Stroke
- Up Stroke
- CAGED

결과.

### 7. Cache / Lazy Loading

결과.

### 8. Tests

```text
XX tests
XX passed
XX failed
```

### 9. Build

```text
SUCCESS / FAIL
```

### 10. GitHub Pages

```text
https://uincity.github.io/guitar/
```

배포 호환성 결과.

### 11. License

FreePats package에서 실제 확인한 정보.

### 12. 발견된 문제

경로, SFZ, WAV, build, browser 등.

### 13. 향후 개선 추천

- String-aware sample
- Velocity layers
- Round robin
- Nylon / Steel selector
- Articulation
- Sample size optimization

---

# 67. 최우선 원칙

이번 작업의 핵심은 단순히 WAV를 "재생"하는 것이 아니다.

다음 연결을 정확하게 만드는 것이 핵심이다.

```text
Guitar String / Fret
        ↓
Actual MIDI
        ↓
SFZ Sample Mapping
        ↓
FreePats WAV
        ↓
Pitch / Velocity 처리
        ↓
Web Audio API
        ↓
실제 Nylon Guitar Sound
```

그리고 이 구조가 기존:

```text
Chord
Movable Shape
Barre
CAGED
```

전체에서 하나의 공통 AudioEngine으로 작동해야 한다.

UI 장식보다 sample mapping 정확성,
Vite/GitHub Pages asset 안정성,
실제 음높이 정확성을 우선한다.
