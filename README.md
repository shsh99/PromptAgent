# PromptBuilder

AI 프롬프트 생성기입니다. 목적과 키워드를 입력하면 적절한 프롬프트 기술을 추천하고, 입력값을 바탕으로 구조화된 프롬프트를 생성합니다.

## 배포 주소

- 운영 URL: https://promptbuilder-df6.pages.dev/

## 주요 기능

- 8가지 프롬프트 기술 지원
- 목적 기반 프롬프트 추천
- 자동 필드 생성
- 프롬프트 품질 점검
- 생성 결과 복사 및 다운로드
- 프롬프트 히스토리와 라이브러리
- 관리자 전용 로그 조회

## 현재 로그 구조

- 일반 사용자는 로그인 없이 사용합니다.
- 브라우저별 익명 `visitor_id`를 발급해 로그를 식별합니다.
- 프롬프트 생성, 복사, 다운로드, 개선 같은 이벤트는 서버로 전송됩니다.
- 로그 조회와 삭제는 `X-Admin-Token`이 있는 관리자만 가능합니다.

## 기술 스택

- Backend: Hono
- Frontend: JSX 기반 서버 렌더링 + 정적 JavaScript/CSS
- Build: Vite
- Deploy: Cloudflare Pages

## 프로젝트 구조

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx
|   |   |-- renderer.tsx
|   |   `-- routes.ts
|   `-- public/
|       `-- static/
|           |-- app.js
|           |-- history.js
|           |-- improve.js
|           |-- library.js
|           |-- prompt.js
|           `-- style.css
|-- vite.config.ts
|-- wrangler.jsonc
|-- package.json
`-- ecosystem.config.cjs
```

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 배포

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name promptbuilder --branch main --commit-dirty=true
```

## 환경변수

- `ADMIN_TOKEN`: 관리자 로그 조회용 비밀 토큰

## API 요약

- `GET /`: 메인 페이지
- `GET /api/techniques`: 기술 목록
- `GET /api/techniques/:id`: 기술 상세
- `GET /api/purposes`: 목적 목록
- `POST /api/recommend`: 기술 추천
- `POST /api/auto-fill`: 필드 자동 생성
- `POST /api/generate`: 프롬프트 생성
- `POST /api/generate-chain`: 체인 프롬프트 생성
- `POST /api/generate-context-doc`: context.md 생성
- `POST /api/improve`: 프롬프트 개선
- `POST /api/logs`: 이벤트 로그 저장
- `GET /api/admin/logs`: 관리자 로그 조회
- `DELETE /api/admin/logs`: 관리자 로그 삭제

## 참고

- `node_modules/`, `dist/`, `.wrangler/`는 배포 산출물이므로 저장소에서 제외합니다.
- 현재 저장 방식은 무료 전제를 유지하기 위해 서버 메모리 기반 로그 저장입니다. 운영 환경에서는 D1 같은 영속 저장소로 옮기는 게 맞습니다.
