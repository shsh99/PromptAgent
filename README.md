# PromptBuilder

AI 프롬프트 생성기입니다. 사용 목적과 키워드를 입력하면 적절한 프롬프트 기법을 추천하고, 입력값을 바탕으로 구조화된 프롬프트를 생성합니다.

## 배포 주소

- 운영 URL: https://prompt-agent.ggg9905.workers.dev/
- 배포 URL: https://prompt-agent.ggg9905.workers.dev/

`pages.dev` 기본 주소의 `-df6` 접미사는 Cloudflare가 부여한 값이라 직접 제거하기 어렵습니다. 깔끔한 주소가 필요하면 커스텀 도메인을 연결하는 방식이 맞습니다.

## 스크린샷

### 메인 화면

<p align="center">
  <img src="https://github.com/user-attachments/assets/582feafa-c2b4-4ea4-a532-1d8644197d22" alt="PromptBuilder 메인 화면" width="92%" />
</p>

### 가이드

<p align="center">
  <img src="https://github.com/user-attachments/assets/508d129c-502a-4268-a1df-c1f539dd39b7" alt="PromptBuilder 가이드 화면" width="62%" />
</p>

### 실제 사용 예시

<p align="center">
  <img src="https://github.com/user-attachments/assets/3c505f3f-89d7-41f9-b685-a431db6deb4c" alt="PromptBuilder 사용 예시 1" width="48%" />
  <img src="https://github.com/user-attachments/assets/2a337a94-a636-43e9-9806-d42f51acfbf3" alt="PromptBuilder 사용 예시 2" width="48%" />
</p>

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

## API 개요

- `GET /`: 메인 페이지
- `GET /api/techniques`: 기법 목록 조회
- `GET /api/techniques/:id`: 기법 상세 조회
- `GET /api/purposes`: 목적 목록 조회
- `POST /api/generate`: 프롬프트 생성

## 참고

- `node_modules/`, `dist/`, `.wrangler/` 는 재생성 가능하므로 저장소에서 제외합니다.
- 현재 배포 대상은 Cloudflare Pages 프로젝트 `promptbuilder` 입니다.
