# PromptBuilder

PromptBuilder는 프롬프트 생성, 개선, 최적화, 이력 관리, 관리자 분석을 한곳에서 다루는 웹 애플리케이션입니다.

## 주요 기능

- 템플릿 모드로 빠르게 시작
- 컨텍스트 엔지니어링 기반 설계
- 최적화 모드로 기존 프롬프트 개선
- 생성 결과 3개 버전 비교
- 결과 화면에서 Optimize로 즉시 이동
- 메인 화면에서 생성, 이력, 분석 바로 확인
- 생성 결과 이력 저장
- 관리자 전체보기
- 라이트/다크 테마 전환
- 모바일 전용 메뉴

## 관리자 진입

1. 상단의 `관리자 모드` 버튼을 누릅니다.
2. 관리자 토큰을 입력합니다.
3. 관리자 대시보드로 진입합니다.

기본 토큰은 `promptbuilder-admin`입니다.  
서버 환경변수 `ADMIN_TOKEN`이 있으면 그 값이 우선됩니다.

## 무료 저장소

무료 운영에서는 브라우저 `localStorage`와 Cloudflare D1을 함께 사용합니다.

- 사용자 이력과 샘플은 브라우저에 저장합니다.
- 서버 로그와 관리자 집계는 D1에 저장합니다.
- 생성 프롬프트, 개선 버전, 최적화 흐름은 동일한 저장 구조를 재사용합니다.

### D1 연결 순서

1. Cloudflare 대시보드에서 D1 데이터베이스를 생성합니다.
2. Pages 프로젝트에 D1 바인딩을 추가합니다.
3. 바인딩 이름은 `DB`를 사용합니다.
4. `wrangler.toml`에 D1 정보를 반영합니다.
5. 마이그레이션을 적용합니다.

```bash
npm run d1:migrate
```

또는 직접 실행할 수 있습니다.

```bash
wrangler d1 migrations apply DB --remote --config wrangler.toml
```

### 마이그레이션 파일

- `migrations/0001_event_logs.sql`
- `migrations/0002_prompt_history_and_suggestions.sql`
- `migrations/0003_prompt_training_samples.sql`
- `migrations/0004_prompt_thread_variants.sql`

## 실행

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
- `wrangler.jsonc`는 기존 호환용입니다.

## 업데이트 로그

최근 변경 내용은 `webapp/public/static/features/common/changelog.js`에서 확인할 수 있습니다.

## 페이즈 정리 기준

- 기능은 `docs/phase.md` 기준으로 페이즈 단위로 정리합니다.
- 현재 우선순위는 `결과 3개 생성 -> Optimize -> Compare/히스토리 -> Intent Engine -> 관리자 분석`입니다.
- 새 기능을 추가할 때는 `README`, `docs/phase.md`, `docs/plan.md`, `webapp/public/static/features/common/changelog.js`를 함께 갱신합니다.

## Recent Work

- 프롬프트 품질 분석에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 추가했습니다.
- 생성된 프롬프트에 최종 검증 블록 전에 전략 가이드 블록을 넣도록 했습니다.
- 이번 작업이 문서와 변경 로그에 함께 기록되도록 정리했습니다.

- 템플릿, 빌더, 결과 패널에 공통 surface 토큰과 반응형 밀도 규칙을 적용했습니다.
- 홈 화면 카드와 액션 버튼을 재사용 가능한 surface 클래스 기반으로 통일했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 레이어를 `System / Template / User Input`으로 분리했습니다.
- 복잡도에 따라 `low`는 간단 템플릿, `high`는 확장 템플릿을 사용하도록 정리했습니다.
- 토큰 낭비를 줄이기 위해 최종 검증도 복잡도에 맞게 축약/확장되도록 맞췄습니다.
