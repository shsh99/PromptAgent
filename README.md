# PromptBuilder

프롬프트를 몰라도 AI를 잘 쓰게 만드는 플랫폼입니다.

이 프로젝트는 프롬프트를 자동으로 뚝딱 만들어주는 생성기가 아닙니다.  
사용자의 목적과 맥락을 구조화하고, 빠진 정보를 예시와 기본값으로 채워서, 거의 완성형에 가까운 프롬프트 구조를 만드는 도구입니다.

업무 템플릿으로 쉽게 시작하고, 빌더로 직접 설계하고, 최적화로 품질을 높입니다.

## 배포 URL

- 최신 배포: https://7a124d66.promptbuilder-df6.pages.dev

## 이 프로젝트의 핵심

- 프롬프트 작성이 익숙하지 않은 사람도 AI를 잘 쓰게 돕습니다.
- 일반 사무직 사용자는 템플릿으로 빠르게 시작할 수 있습니다.
- 개발자와 전문가 사용자는 빌더로 구조를 직접 설계할 수 있습니다.
- 최적화 모드에서 결과를 기반으로 프롬프트를 반복 개선할 수 있습니다.

## 주요 문제와 해결 방식

이 플랫폼이 해결하려는 문제는 다음과 같습니다.

- 사용자는 무엇을 입력해야 하는지 모른다.
- 필요한 정보 일부를 비워 두는 경우가 많다.
- 프롬프트는 작성했지만 좋은지 판단하기 어렵다.
- 결과를 본 뒤 다시 고쳐야 하는데 흐름이 복잡하다.

이를 해결하기 위해 다음 구조를 사용합니다.

- 문제 정의
- 입력 데이터
- 작업 목표
- 제약 조건
- 출력 형식
- 평가 기준
- 예시와 기본값
- 반복 개선 루프

## 핵심 모드

### 1. 퀵 모드

사무직, 비개발자, 초보자를 위한 빠른 시작 모드입니다.

- 이메일
- 회의 요약
- 보고서 초안
- 자기소개서
- 기획안
- 블로그 초안

카드를 누르면 목적과 구조가 자동으로 채워져서 바로 시작할 수 있습니다.

### 2. 고급자 모드

개발자, 기획자, 파워 유저를 위한 구조 설계 모드입니다.

- 역할 정의
- 문제 정의
- 입력/출력 구조
- 제약 조건
- 평가 기준
- 예시 기반 설계

빈칸이 있어도 기본값과 예시를 자동으로 보강해서 완성형 프롬프트를 만들 수 있습니다.

### 3. 최적화 모드

기존 프롬프트와 실제 결과를 함께 넣고, 문제를 분석한 뒤 개선안을 만드는 모드입니다.

- 프롬프트 입력
- 결과 입력
- 목표 입력
- 문제점 분석
- 개선안 생성
- 버전 저장
- 비교 / 롤백

## 제공 기능

- 템플릿 기반 빠른 시작
- 하네스 기반 구조 설계
- 결과 기반 최적화
- 버전 비교와 롤백
- 예시 템플릿과 도움말
- 한국어 우선 출력
- 영어 선택 지원
- 라이트 / 다크 테마
- 배포 로그 기록
- 로컬 히스토리 저장

## 화면 구성

- 상단: 모드 전환, 테마, 언어, 도움말, 히스토리
- 본문: 퀵 모드, 고급자 모드, 최적화 모드
- 우측/하단: 품질 분석, 버전 비교, 실행 결과
- 로그: 배포마다 업데이트 로그를 추가

## 프롬프트 구조

이 프로젝트는 다음 구조를 기본으로 사용합니다.

```text
SYSTEM DIRECTIVE
ROLE
PROBLEM DEFINITION
OBJECTIVE
INPUT CONTEXT
CORE CONCEPT
TASK
CONSTRAINTS
REASONING STRATEGY
OUTPUT SPEC
EVALUATION CRITERIA
FAILURE HANDLING
OUTPUT LANGUAGE
```

이 구조를 바탕으로 사용자의 입력이 부족해도 AI가 맥락을 이해할 수 있도록 설계합니다.

## 프로젝트 구성

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx       # 메인 화면
|   |   |-- renderer.tsx    # HTML 셸
|   |   |-- routes.ts       # API
|   |   |-- helpers.ts      # 분석/자동 채움/생성 로직
|   |   |-- data.ts         # 기술, 목적, 필드 정의
|   |-- public/static/
|   |   |-- app.js          # 전역 상태, 테마, 언어
|   |   |-- technique.js    # 목적/기술 선택 UI
|   |   |-- prompt.js       # 생성 결과 렌더링
|   |   |-- optimize.js     # 최적화 모드
|   |   |-- style.css       # 전역 스타일
|   |   |-- changelog.js    # 배포 로그
|-- docs/                   # 설계 문서
|-- scripts/                # 빌드/배포 보조 스크립트
|-- dist/                   # 배포 산출물
```

## 개발 및 실행

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

## 추천 사용 예시

- 업무 이메일 초안 생성
- 회의 내용 정리
- 보고서 구조 설계
- 코드 리뷰 프롬프트 작성
- 프로젝트 기획서 작성
- 마케팅 문구 작성
- 프롬프트 최적화와 재작성

## English

PromptBuilder is a Korean-first platform that helps people use AI well even if they do not know how to write prompts.

It is not an automatic prompt generator. It is a structure-first prompt platform that fills missing fields with examples and sensible defaults, so users can create near-complete prompt frameworks and paste them into ChatGPT, Claude, Gemini, or other LLM tools.

### Latest Deployment

- https://7a124d66.promptbuilder-df6.pages.dev

### What It Does

- Helps users start from templates
- Lets advanced users design prompts with a builder
- Improves prompts using real outputs
- Fills missing blanks with defaults and examples
- Supports versioning, comparison, and rollback
- Keeps Korean as the default output language

### Core Modes

- Template Mode: fast start for office workflows
- Builder Mode: structured prompt design for advanced users
- Optimize Mode: result-driven prompt improvement

### Project Structure

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx
|   |   |-- renderer.tsx
|   |   |-- routes.ts
|   |   |-- helpers.ts
|   |   |-- data.ts
|   |-- public/static/
|   |   |-- app.js
|   |   |-- technique.js
|   |   |-- prompt.js
|   |   |-- optimize.js
|   |   |-- style.css
|   |   `-- changelog.js
|-- docs/
|-- scripts/
|-- dist/
```

### Build and Deploy

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name promptbuilder --branch main --commit-dirty=true
```
