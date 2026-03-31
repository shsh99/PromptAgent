# PromptBuilder

프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼입니다.
업무 템플릿으로 쉽게 시작하고, 빌더로 직접 설계하고, 최적화로 품질을 높이세요.

## What It Does

- 선택한 방식에 따라 구조화된 프롬프트를 생성합니다
- 프롬프트의 약점을 분석하고 개선 포인트를 제안합니다
- 결과를 바탕으로 프롬프트를 반복 개선합니다
- Optimize Mode에서 실행-평가-개선 루프를 지원합니다
- 버전과 히스토리를 로컬에 저장합니다
- 시작용 템플릿과 예시를 제공해 처음 진입을 쉽게 만듭니다

## Main Modes

- Template Mode: quick starter prompts for common use cases
- Builder Mode: harness-style prompt construction
- Optimize Mode: result-driven prompt improvement and version comparison

## Key Features

- prompt harness fields
- problem framing and output schema support
- quality scoring and improvement hints
- version history with compare and rollback
- example prompts and starter templates
- checklist-style prompt helpers

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name promptbuilder --branch main --commit-dirty=true
```

## Project Layout

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
|           |-- optimize.js
|           |-- prompt.js
|           `-- style.css
|-- docs/
|-- vite.config.ts
|-- wrangler.jsonc
|-- package.json
`-- ecosystem.config.cjs
```

## API Overview

- `GET /`
- `GET /api/techniques`
- `GET /api/techniques/:id`
- `GET /api/purposes`
- `POST /api/recommend`
- `POST /api/auto-fill`
- `POST /api/generate`
- `POST /api/generate-chain`
- `POST /api/generate-context-doc`
- `POST /api/improve`
- `POST /api/optimize`
- `POST /api/logs`
- `GET /api/admin/logs`
- `DELETE /api/admin/logs`

## Notes

- The app is designed to stay usable without paid APIs.
- Examples and helper templates are stored locally and can be expanded over time.
- Version comparison and rollback are implemented in Optimize Mode.
