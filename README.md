# PromptBuilder

PromptBuilder는 프롬프트를 잘 모르는 사용자도 구조를 따라가며 AI를 쉽게 활용할 수 있게 돕는 도구입니다.

## 사이트

- [PromptBuilder](https://promptbuilder-df6.pages.dev/)

## 핵심 기능

- 템플릿 모드로 빠르게 시작
- 빌더 모드로 구조화된 프롬프트 설계
- 최적화 모드로 기존 결과 개선
- 결과 3개 생성 및 비교
- 히스토리 저장과 버전 확인
- 관리자 대시보드와 사용 현황 확인
- 라이트/다크 모드 지원
- 모바일에서도 사용 가능한 레이아웃

## 관리자 진입

1. 상단 또는 하단의 `관리자 모드` 버튼을 누릅니다.
2. 관리자 토큰을 입력합니다.
3. 관리자 대시보드로 이동합니다.

기본 토큰은 `promptbuilder-admin`입니다.  
서버 환경변수 `ADMIN_TOKEN`이 있으면 해당 값이 우선됩니다.

## 저장 방식

PromptBuilder는 브라우저 저장소와 Cloudflare D1을 함께 사용합니다.

- 사용자 입력과 일부 상태는 브라우저에 저장합니다.
- 서버 로그와 관리자 집계는 D1에 저장합니다.
- 생성 결과, 개선 버전, 히스토리 흐름은 같은 구조를 재사용합니다.

## D1 연결

1. Cloudflare 대시보드에서 D1 데이터베이스를 생성합니다.
2. Pages 프로젝트에 D1 바인딩을 추가합니다.
3. 바인딩 이름을 `DB`로 사용합니다.
4. `wrangler.toml`에 D1 정보를 반영합니다.
5. 마이그레이션을 적용합니다.

```bash
npm run d1:migrate
```

또는 직접 실행할 수 있습니다.

```bash
wrangler d1 migrations apply DB --remote --config wrangler.toml
```

## 마이그레이션 파일

- `migrations/0001_event_logs.sql`
- `migrations/0002_prompt_history_and_suggestions.sql`
- `migrations/0003_prompt_training_samples.sql`
- `migrations/0004_prompt_thread_variants.sql`

## 개발

```bash
npm install
npm run build
npm run dev
```

## 배포

```bash
npm run deploy
```

## 설정 파일

- `wrangler.toml`
- `wrangler.jsonc`

## 업데이트 로그

최근 변경 내용은 `webapp/public/static/features/common/changelog.js`에 기록합니다.

## 페이즈 기준

- 기능 우선순위는 `docs/phase.md`를 기준으로 정리합니다.
- 현재 우선순위는 `결과 3개 생성 -> Optimize -> Compare/히스토리 -> Intent Engine -> 관리자 분석`입니다.
- 새 기능을 추가할 때는 `README.md`, `docs/phase.md`, `docs/plan.md`, `webapp/public/static/features/common/changelog.js`를 함께 갱신합니다.

## Recent Work

- 홈 화면의 히어로 문구와 버튼 배치를 정리했습니다.
- `빠른 흐름` 안내를 모드 선택 패널 내부로 넣어 빈 공간을 줄였습니다.
- AI 스타일 패널의 높이와 토큰을 좌우 컬럼에 맞췄습니다.
- 템플릿 시작용 보조 카드 블록을 제거했습니다.
- 다크 모드와 라이트 모드의 버튼 대비를 개선했습니다.
- 업데이트 로그와 문서를 현재 구조에 맞게 정리했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 구조를 `System / Template / User Input`으로 분리했습니다.
- complexity가 낮을 때는 간단 템플릿, 높을 때는 고정 구조를 사용하도록 정리했습니다.
- 최종 검증 블록도 입력 구조에 맞춰 다시 맞췄습니다.

## Recent History UI Work

- 히스토리에서 이전 버전을 아래로 스크롤하지 않고 탭으로 전환할 수 있게 했습니다.
- 선택한 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.
- 카드 내부에서 버전 비교 흐름을 다시 보기 쉽게 맞췄습니다.

## 최근 작업 요약

- 업데이트 로그를 최신 상태로 정리했습니다.
- 관리자 대시보드와 히스토리 UX를 개선했습니다.
- 프롬프트 생성, 비교, 분석 흐름을 phase 기준으로 정리했습니다.
- 문서와 changelog를 함께 갱신하는 규칙을 정착시켰습니다.

## 작업을 진행할 때의 기준

1. 구조 변경보다 먼저 연결 상태를 확인합니다.
2. 기능 분리 시 파일 간 책임 경계를 먼저 맞춥니다.
3. UI는 기능을 줄이기보다 보이는 밀도와 동선을 조정합니다.
4. 문서 변경은 실제 코드 변경과 함께 기록합니다.
5. 테스트와 빌드를 끝까지 확인한 뒤 마무리합니다.

## 남은 방향

- 결과 3개 생성과 비교 UX를 더 안정화합니다.
- Optimize와 히스토리 이동을 더 짧게 만듭니다.
- Intent Engine과 설명 레이어를 이어 붙입니다.
- 관리자 분석을 더 읽기 쉽게 다듬습니다.
- 템플릿 라이브러리를 더 확장합니다.
