# PromptBuilder

## 한국어

프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼입니다.

이 프로젝트는 프롬프트를 자동으로 뚝딱 만들어내는 생성기가 아닙니다.
사용자가 원하는 목적을 기준으로, 빠진 정보를 채우고, 구조를 정리하고, 빈칸을 보완해서
거의 완성형에 가까운 프롬프트 구조를 만들어 주는 플랫폼입니다.

특히 사무직, 비개발자, 그리고 프롬프트 작성이 익숙하지 않은 사용자가
아주 쉽게 시작할 수 있도록 설계했습니다.

### 핵심 흐름

1. 업무 템플릿으로 빠르게 시작
2. 빌더로 문제 정의, 입력, 출력, 제약 조건을 직접 설계
3. 최적화로 결과를 평가하고 반복 개선
4. 부족한 입력은 예시와 기본값으로 보완
5. 생성된 구조를 LLM에 그대로 넣어 작업 실행

### 제공 기능

- 업무 템플릿 시작
- 하네스 기반 프롬프트 설계
- 결과 기반 프롬프트 최적화
- 버전 비교와 롤백
- 예시 입력과 도움말 제공
- 로컬 히스토리 저장
- 라이트 / 다크 테마

### 모드

- `Template Mode`: 자주 쓰는 업무를 바로 시작하는 빠른 진입점
- `Builder Mode`: 프로젝트 설계용 구조를 직접 만드는 모드
- `Optimize Mode`: 이미 만든 프롬프트를 결과 기준으로 개선하는 모드

### 로컬 개발

```bash
npm install
npm run dev
```

### 빌드

```bash
npm run build
```

### 배포

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name promptbuilder --branch main --commit-dirty=true
```

## English

PromptBuilder is a platform that helps people use AI well even if they do not know how to write prompts.

It is not a prompt generator that creates everything automatically.
It is a structure-first platform that fills in the missing parts, organizes the flow, and helps users create near-complete prompt frameworks.

The product is designed for office workers, non-developers, and anyone who struggles with prompt writing.

### Core Flow

1. Start quickly with an office-ready template
2. Use the builder to define the problem, inputs, output, and constraints
3. Optimize based on the result and iterate
4. Fill missing gaps with examples and defaults
5. Paste the generated structure into an LLM to get work done

### Features

- Template-based quick start
- Harness-style prompt design
- Result-driven prompt optimization
- Version compare and rollback
- Examples and helper guidance
- Local history storage
- Light and dark themes

### Modes

- `Template Mode`: fast entry for common use cases
- `Builder Mode`: build prompt structures for projects
- `Optimize Mode`: improve prompts based on outputs

### Local Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

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
