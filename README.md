# PromptBuilder

## 한국어

프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼입니다.

이 프로젝트는 프롬프트를 자동으로 뚝딱 만들어내는 생성기가 아닙니다.
사용자가 원하는 목적을 기준으로, 빠진 정보를 채우고, 구조를 정리하고, 빈칸을 보완해서
거의 완성형에 가까운 프롬프트 구조를 만들어 주는 플랫폼입니다.

특히 사무직, 비개발자, 그리고 프롬프트 작성이 익숙하지 않은 사용자가
아주 쉽게 시작할 수 있도록 설계했습니다.

### 배포 주소

- 최신 배포: https://5a556576.promptbuilder-df6.pages.dev

### 이 프로젝트가 하는 일

- 사용자가 어떤 일을 시키고 싶은지 먼저 정리합니다.
- 빠진 입력을 예시와 기본값으로 보완합니다.
- 문제 정의, 입력, 출력, 제약 조건, 예시를 포함한 구조를 만듭니다.
- 생성된 구조를 그대로 LLM에 넣어 사용할 수 있게 돕습니다.
- 이미 만든 프롬프트는 결과 기준으로 다시 개선할 수 있습니다.

### 핵심 흐름

1. 업무 템플릿으로 빠르게 시작
2. 빌더로 문제 정의, 입력, 출력, 제약 조건을 직접 설계
3. 최적화로 결과를 평가하고 반복 개선
4. 부족한 입력은 예시와 기본값으로 보완
5. 생성된 구조를 LLM에 그대로 넣어 작업 실행

### 구성 방식

- `Template Mode`: 사무직이 바로 쓸 수 있는 빠른 시작 모드
- `Builder Mode`: 개발자와 고급 사용자를 위한 구조 설계 모드
- `Optimize Mode`: 결과를 넣고 프롬프트를 개선하는 반복 최적화 모드
- `Light / Dark Theme`: 전체 화면 테마 전환
- `Korean / English`: 기본은 한국어, 필요할 때만 영어

### 제공 기능

- 업무 템플릿 시작
- 하네스 기반 프롬프트 설계
- 결과 기반 프롬프트 최적화
- 버전 비교와 롤백
- 예시 입력과 도움말 제공
- 로컬 히스토리 저장
- 라이트 / 다크 테마
- 기본 한국어 출력, 필요할 때만 영어 전환

### 주요 사용 예시

- 자소서 작성
- 회의록 정리
- 보고서 초안
- 코드 리뷰
- 마케팅 문구 작성
- 프로젝트 설계
- 진행 중 질문 정리
- 기존 프롬프트 개선

### 모드

- `Template Mode`: 자주 쓰는 업무를 바로 시작하는 빠른 진입점
- `Builder Mode`: 프로젝트 설계용 구조를 직접 만드는 모드
- `Optimize Mode`: 이미 만든 프롬프트를 결과 기준으로 개선하는 모드

### 추천 대상

- 프롬프트를 잘 쓰지 못하는 일반 사용자
- 사무직, 기획자, 마케터
- 개발자와 스타트업 팀
- 프롬프트 품질을 반복적으로 높이고 싶은 사용자

### 프로젝트 구조

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx      # 메인 화면
|   |   |-- renderer.tsx   # HTML 레이아웃
|   |   |-- routes.ts      # API 라우트
|   |   |-- helpers.ts     # 프롬프트 분석/생성 헬퍼
|   |   |-- data.ts        # 기법/목적/필드 정의
|   |-- public/static/
|   |   |-- app.js         # 전역 상태/테마
|   |   |-- prompt.js      # 생성 결과 렌더링
|   |   |-- optimize.js    # 최적화 모드
|   |   |-- technique.js   # 목적/기법 선택 UI
|   |   |-- style.css      # 전역 디자인
|   |   |-- changelog.js   # 업데이트 로그
|-- docs/                  # 설계 문서
|-- scripts/               # 빌드/배포 보조 스크립트
|-- dist/                  # 배포 산출물
```

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

### Deployment

- Latest deployment: https://5a556576.promptbuilder-df6.pages.dev

### What This Project Does

- Helps users define the work they want AI to do.
- Fills missing input with examples and sensible defaults.
- Creates a near-complete structure with problem, input, output, constraints, and examples.
- Lets users paste the generated structure directly into an LLM.
- Lets users improve existing prompts using result-driven optimization.

### Core Flow

1. Start quickly with an office-ready template
2. Use the builder to define the problem, inputs, output, and constraints
3. Optimize based on the result and iterate
4. Fill missing gaps with examples and defaults
5. Paste the generated structure into an LLM to get work done

### Architecture

- `Template Mode`: fast entry for office workflows
- `Builder Mode`: structured prompt design for advanced users
- `Optimize Mode`: iterative improvement using prompt and output
- `Light / Dark Theme`: full-site theme switching
- `Korean / English`: Korean-first output with optional English mode

### Features

- Template-based quick start
- Harness-style prompt design
- Result-driven prompt optimization
- Version compare and rollback
- Examples and helper guidance
- Local history storage
- Light and dark themes
- Korean-first output with optional English mode

### Common Use Cases

- Resume or self-introduction drafting
- Meeting notes and summaries
- Report drafting
- Code review prompts
- Marketing copy
- Project planning
- Progress questions
- Prompt refinement

### Modes

- `Template Mode`: fast entry for common use cases
- `Builder Mode`: build prompt structures for projects
- `Optimize Mode`: improve prompts based on outputs

### Recommended For

- Users who are not comfortable writing prompts
- Office workers, planners, and marketers
- Developers and startup teams
- Anyone who wants to improve prompt quality iteratively

### Project Structure

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx      # main page
|   |   |-- renderer.tsx   # HTML shell
|   |   |-- routes.ts      # API routes
|   |   |-- helpers.ts     # analysis and generation helpers
|   |   |-- data.ts        # techniques, purposes, and field definitions
|   |-- public/static/
|   |   |-- app.js         # global state and theme
|   |   |-- prompt.js      # prompt result rendering
|   |   |-- optimize.js    # optimize mode
|   |   |-- technique.js   # purpose / technique selection UI
|   |   |-- style.css      # global styling
|   |   |-- changelog.js   # release log
|-- docs/                  # design docs
|-- scripts/               # build/deploy helpers
|-- dist/                  # deployment output
```

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
