# PromptBuilder

프롬프트 생성, 개선, 최적화, 히스토리 관리, 관리자 분석까지 한 곳에서 다루는 PromptBuilder입니다.

## 주요 기능

- 템플릿 모드로 빠르게 시작
- 빌더 모드로 직접 프롬프트 설계
- 최적화 모드로 기존 프롬프트 개선
- 생성 결과 3개 변형 비교
- 결과 화면의 Optimize 버튼으로 즉시 최적화 진입
- 메인 화면에서 생성 수, 활동 로그 수, 방문자 수 표시
- 생성 결과 히스토리 저장
- 건의사항 게시판
- 관리자 전체화면 대시보드
- 라이트/다크 테마
- 모바일 드로어 메뉴

## 관리자 접속

1. 상단의 `관리자` 버튼을 누릅니다.
2. 관리자 토큰을 입력합니다.
3. 전체화면 관리자 대시보드가 열립니다.

기본 토큰은 `promptbuilder-admin`입니다.  
서버 환경변수 `ADMIN_TOKEN`이 있으면 그 값이 우선됩니다.

## 무료 영구 저장

무료 운영에서는 브라우저 `localStorage`와 Cloudflare D1을 함께 사용합니다.

- 사용자 측 히스토리와 건의사항은 브라우저에 남습니다.
- 서버 로그와 관리자 통계는 D1이 있으면 D1에 저장됩니다.
- 생성된 프롬프트, 개선본, 최적화본은 학습 샘플로도 별도 저장됩니다.

### D1 연결 순서

1. Cloudflare 대시보드에서 D1 데이터베이스를 생성합니다.
2. Pages 프로젝트에 D1 바인딩을 추가합니다.
3. 바인딩 이름은 `DB`를 사용합니다.
4. `wrangler.toml`에 D1 정보를 넣습니다.
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
- `wrangler.jsonc`는 기존 호환용으로 남겨둘 수 있습니다.

## 업데이트 로그

최근 변경 내용은 `webapp/public/static/changelog.js`에서 확인할 수 있습니다.

## 포트폴리오 정리 기준

- 기능은 `docs/phase.md` 기준으로 페이즈 단위로 정리합니다.
- 현재 우선순위는 `결과 3개 생성 -> Optimize -> Compare/히스토리 -> Intent Engine -> 관리자 분석`입니다.
- 새 기능을 추가할 때는 `README`, `docs/phase.md`, `docs/plan.md`, `webapp/public/static/changelog.js`를 같이 갱신합니다.
