# PromptForge

AI 프롬프트 생성기입니다. 사용 목적과 키워드를 입력하면 적절한 프롬프트 기법을 추천하고, 입력값을 바탕으로 구조화된 프롬프트를 생성합니다.

## 배포 주소

- 운영 URL: https://bf9c8fda.webapp-c33.pages.dev
- 프로젝트 기본 도메인: https://webapp-c33.pages.dev

## 주요 기능

- 8가지 프롬프트 기법 지원
- 목적 기반 추천 및 자동 필드 생성
- 프롬프트 품질 점수와 체크리스트 제공
- 생성 결과 복사 및 다운로드
- 로컬 히스토리 저장

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
|   |   `-- renderer.tsx
|   `-- public/
|       |-- favicon.svg
|       `-- static/
|           |-- app.js
|           `-- style.css
|-- vite.config.ts
|-- wrangler.jsonc
|-- package.json
`-- ecosystem.config.cjs
```

## 실행 방법

의존성 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

Cloudflare Pages 로컬 미리보기:

```bash
npm run preview
```

## 배포 방법

Cloudflare 로그인:

```bash
npx wrangler login
```

배포:

```bash
npm run build
npx wrangler pages deploy dist --project-name webapp --branch main --commit-dirty=true
```

## API 개요

- `GET /`: 메인 페이지
- `GET /api/techniques`: 기법 목록 조회
- `GET /api/techniques/:id`: 기법 상세 조회
- `GET /api/purposes`: 목적 목록 조회
- `POST /api/generate`: 프롬프트 생성

## 참고

- `node_modules/`, `dist/`, `.wrangler/` 는 재생성 가능하므로 저장소에서 제외합니다.
- 현재 배포 대상은 Cloudflare Pages 프로젝트 `webapp` 입니다.
