# PromptForge - AI 프롬프트 생성기

## 프로젝트 개요
- **Name**: PromptForge
- **Goal**: 바이브 코딩의 첫 단계인 프롬프트 설계를 도와주는 웹 애플리케이션
- **Features**: 프롬프트 엔지니어링 기법을 자동 적용하여 체계적인 프롬프트를 생성

## 주요 기능

### 완성된 기능
1. **8가지 프롬프트 엔지니어링 기법 지원**
   - 제로샷 프롬프트 (Zero-shot) - 초급
   - 퓨샷 프롬프트 (Few-shot) - 초급
   - 사고 연쇄 CoT (Chain-of-Thought) - 중급
   - 사고 트리 ToT (Tree of Thought) - 고급
   - 역할 프롬프트 (Role Prompting) - 초급
   - 프롬프트 체이닝 (Prompt Chaining) - 중급
   - 메타 프롬프팅 (Meta Prompting) - 고급
   - 하네스 엔지니어링 (Harness Engineering) - 고급

2. **3단계 가이드 프로세스**
   - Step 1: 프로젝트 목적 선택 (웹앱, 모바일, AI, 데이터분석 등 8종)
   - Step 2: 프롬프트 기법 선택 (난이도/특성별 8가지)
   - Step 3: 세부 정보 입력 (기법별 맞춤 필드)

3. **프롬프트 품질 분석 리포트**
   - S/A/B/C/D 등급 자동 평가
   - 7가지 체크리스트 (역할, 구체성, 형식, 제약조건, 컨텍스트, 정보량, 톤)
   - 기법별 팁 제공

4. **기타 기능**
   - 프롬프트 복사/다운로드
   - 생성 히스토리 (localStorage, 최대 20건)
   - 프롬프트 엔지니어링 가이드 모달
   - 반응형 디자인 (모바일/태블릿/데스크톱)

## URL 구조

### 페이지
| URL | 설명 |
|-----|------|
| `/` | 메인 페이지 (프롬프트 생성기) |

### API 엔드포인트
| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/techniques` | 기법 목록 조회 |
| GET | `/api/techniques/:id` | 기법 상세 + 필드 정보 조회 |
| GET | `/api/purposes` | 프로젝트 목적 프리셋 조회 |
| POST | `/api/generate` | 프롬프트 생성 |

### POST /api/generate 파라미터
```json
{
  "techniqueId": "harness",
  "fields": {
    "role": "역할 설명",
    "context": "배경 컨텍스트",
    "task": "작업 목표",
    "output_format": "출력 형식",
    "tone": "톤",
    "constraints": "제약 조건"
  },
  "purpose": "web-app",
  "keyword": "키워드"
}
```

## 기술 스택
- **Backend**: Hono (TypeScript)
- **Frontend**: Vanilla JS + Tailwind CSS + FontAwesome
- **Platform**: Cloudflare Pages
- **Build**: Vite

## 배포
- **Platform**: Cloudflare Pages
- **Status**: Active
- **Last Updated**: 2026-03-30
