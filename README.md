# PromptBuilder

프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼입니다.

이 프로젝트는 프롬프트를 자동으로 “뚝딱 생성”하는 도구가 아닙니다.  
사용자가 좋은 프롬프트를 만들 수 있도록 구조를 제공하고, 부족한 입력은 예시와 기본값으로 보완하며, 결과를 비교하고 최적화할 수 있게 돕는 플랫폼입니다.

업무 템플릿으로 쉽게 시작하고, 빌더로 직접 설계하고, 최적화로 품질을 높일 수 있습니다.

## 최신 배포

- [PromptBuilder](https://promptbuilder-df6.pages.dev/)

## 프로젝트 개요

- 한국어 우선 UI
- 라이트 / 다크 모드 지원
- 사무직 친화형 빠른 시작 모드
- 고급 사용자용 프롬프트 빌더
- 결과 기반 최적화 모드
- 버전 관리 / 비교 / 롤백
- 관리자용 로그 및 통계 화면
- 배포마다 업데이트 로그 자동 누적

## 왜 필요한가

기존 프롬프트 작성은 보통 이런 문제를 가집니다.

- 사용자가 무엇을 입력해야 하는지 모름
- 빈칸이 많아도 그걸 어떻게 채워야 하는지 모름
- 한 번 만든 뒤 끝나서 반복 개선이 어려움
- 결과를 비교하거나 버전 관리하기 어려움
- 관리자 입장에서 어떤 프롬프트가 잘 쓰였는지 확인하기 어려움

PromptBuilder는 이 문제를 해결합니다.

## 핵심 기능

### 1. Template Mode
사무직, 기획, 마케팅, 회의록, 보고서, 이메일 같은 실무 작업을 빠르게 시작하는 모드입니다.

### 2. Builder Mode
개발자, 기획자, 고급 사용자용 구조 설계 모드입니다.

### 3. Optimize Mode
기존 프롬프트와 결과를 보고 문제를 분석한 뒤, 개선안을 만드는 모드입니다.

### 4. Intent / Prompt / Output 구조

핵심 설계는 다음 3단계 구조를 따릅니다.

1. Intent Engine
   - 사용자의 입력을 분석해 목표, 맥락, 의도를 구조화합니다.
2. Prompt Engine
   - Role / Task / Context / Constraints / Output Format 기반으로 프롬프트를 생성합니다.
3. Output Engine
   - Creative / Balanced / Optimized의 3가지 결과를 생성하고 비교할 수 있게 합니다.

### 5. 빈칸 자동 보완
- 사용자가 입력하지 않은 값은 예시, 기본값, 문맥을 기준으로 자동 보완합니다.
- 비개발자도 필요한 입력만 선택하면 완성형 구조가 만들어집니다.

### 6. 관리자 통계
- 생성한 프롬프트 수
- Optimize 사용 수
- Enhance 사용 수
- 조회수
- 복사 수
- 다운로드 수
- 자주 쓰는 템플릿
- 프롬프트 유형별 사용 패턴

## 화면 구성

- 홈: 모드 선택, 빠른 시작, 템플릿 진입
- Template Mode: 업무용 템플릿 중심
- Builder Mode: 상세 입력 기반 구조 설계
- Optimize Mode: 기존 프롬프트 개선 및 비교
- History: 생성 기록과 버전 확인
- Admin: 로그와 통계 확인

## 기술 스택

- Frontend: React / TypeScript
- Runtime: Cloudflare Pages / Workers
- Build: Node.js build script
- Storage: 브라우저 localStorage + 서버 로그
- UI: 정적 스크립트 기반 인터랙션

## 프로젝트 구조

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx
|   |   |-- renderer.tsx
|   |   |-- routes.ts
|   |   |-- helpers.ts
|   |   `-- data.ts
|   `-- public/static/
|       |-- app.js
|       |-- technique.js
|       |-- prompt.js
|       |-- optimize.js
|       |-- history.js
|       |-- changelog.js
|       `-- style.css
|-- docs/
|-- scripts/
`-- dist/
```

## 동작 방식

1. 사용자가 템플릿 또는 모드를 선택합니다.
2. 필요한 입력만 작성합니다.
3. 시스템이 비어 있는 부분을 문맥과 기본값으로 보완합니다.
4. 프롬프트를 생성합니다.
5. 결과를 비교하거나 Optimize로 개선합니다.
6. 버전과 히스토리가 저장됩니다.

## 한국어 / 영어 지원

- 기본 언어는 한국어입니다.
- 사용자가 영어를 선택하면 영어 프롬프트로 생성할 수 있습니다.
- 프롬프트 스타일도 GPT / Claude / Gemini / Genspark / 직접지정으로 선택할 수 있습니다.

## 개발 및 실행

```bash
npm install
npm run build
npm run dev
```

## 배포

```bash
npm run deploy
```

배포가 성공하면 README의 최신 배포 주소가 함께 업데이트됩니다.

## English

PromptBuilder is a Korean-first platform that helps people use AI well even if they do not know how to write prompts.

It is not an automatic prompt generator. It is a structure-first prompt platform that fills missing fields with examples and sensible defaults so users can create near-complete prompt frameworks and paste them into ChatGPT, Claude, Gemini, or other LLM tools.

## Latest Deployment

- [https://fe55eded.promptbuilder-df6.pages.dev](https://fe55eded.promptbuilder-df6.pages.dev)

## What It Does

- Helps users start from templates
- Lets advanced users design prompts with a builder
- Improves prompts using real outputs
- Fills missing blanks with defaults and examples
- Supports versioning, comparison, and rollback
- Keeps Korean as the default output language

## Core Modes

- Template Mode: fast start for office workflows
- Builder Mode: structured prompt design for advanced users
- Optimize Mode: result-driven prompt improvement

## Build and Deploy

```bash
npm install
npm run build
npm run deploy
```
