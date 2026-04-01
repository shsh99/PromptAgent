# PromptBuilder Phase Roadmap

## Current Priority

1. 결과 3개 생성
2. Optimize
3. Compare / 히스토리
4. Intent Engine
5. 설명 레이어
6. 관리자 분석
7. 데이터 분석

## Phase 0. Docs And Agent Scaffold

Status: completed

Goal:
- 작업 기준과 문서 구조를 먼저 정리합니다.

Done when:
- `AGENT.md` exists
- `docs/README.md` exists
- `docs/plan.md` exists
- `docs/phase.md` exists

## Phase 1. Prompt Quality Analyzer

Status: completed

Goal:
- 프롬프트가 왜 약한지 설명할 수 있게 만듭니다.

Includes:
- 모호성 감지
- 역할 누락 감지
- 문제 정의 감지
- 입력 데이터 감지
- 추론 방향 감지
- 예시 감지
- 제약 조건 감지
- 출력 구조 감지
- 토큰 낭비 힌트
- 실패 대응 제안
- 모델별 힌트

Done when:
- 사용자가 약한 부분과 수정 방향을 바로 볼 수 있습니다.

Work docs:
- `docs/tasks/phase-1/design.md`
- `docs/tasks/phase-1/plan.md`
- `docs/tasks/phase-1/plan-01-analyzer-core.md`
- `docs/tasks/phase-1/plan-02-suggestions.md`
- `docs/tasks/phase-1/plan-03-model-hints.md`
- `docs/tasks/phase-1/plan-04-ui-logging.md`
- `docs/tasks/phase-1/plan-05-content-architecture.md`

## Phase 2. Prompt Versioning And Optimize Loop

Status: in progress

Goal:
- 여러 프롬프트 변형을 만들고 바로 개선할 수 있게 합니다.

Includes:
- 결과 3개 생성
- Optimize 진입
- 프롬프트 실행기
- 출력 평가
- 버전 저장
- 버전 복원
- diff 보기
- 버전 라벨
- 히스토리 확인

Current focus:
- 결과 3개 생성
- Optimize 진입
- Compare / 히스토리 흐름

Done when:
- 사용자가 앱을 떠나지 않고 두 버전을 비교할 수 있습니다.
- 생성 결과에서 바로 Optimize로 이동할 수 있습니다.

Work docs:
- `docs/tasks/phase-2/design.md`
- `docs/tasks/phase-2/plan.md`
- `docs/tasks/phase-2/plan-01-mode-switch.md`
- `docs/tasks/phase-2/plan-02-runner.md`
- `docs/tasks/phase-2/plan-03-evaluator.md`
- `docs/tasks/phase-2/plan-04-versioning.md`
- `docs/tasks/phase-2/plan-05-loop-history.md`
- `docs/tasks/phase-2/plan-06-ui-reference.md`
- `docs/tasks/phase-2/plan-07-examples-helpers.md`

## Phase 3. Intent Engine And Explanation Layer

Status: pending

Goal:
- 사용자의 의도를 추론하고 추천 이유를 설명합니다.

Includes:
- 의도 파싱
- 설명 블록
- 이유 라벨
- 추천 근거

Done when:
- 사용자가 왜 이런 모드나 구조가 추천됐는지 이해할 수 있습니다.

## Phase 4. Admin And Analytics

Status: pending

Goal:
- 사용량과 품질을 관리 화면에서 읽기 쉽게 보여줍니다.

Includes:
- 관리자 대시보드
- 일별 사용 추이
- 프롬프트 유형 분포
- 결과 변형 선택 패턴
- 내보내기와 감사 로그
- 라이트/다크 토큰 일관성
- 긴 세로 스크롤 대신 섹션 전환
- 프로젝트 맞춤 문구
- 탭 전환형 사이드바

Recent work:
- 관리자 대시보드를 카드형 워크스페이스로 다시 정리했습니다.
- 라이트/다크 모드 토큰을 분리해서 버튼 글자가 잘 보이게 했습니다.
- 사이드바 탭을 누르면 섹션이 바뀌도록 정리했습니다.

Done when:
- 관리자가 사용자 행동과 개선 우선순위를 한눈에 볼 수 있습니다.

## Phase 5. Template Library

Status: pending

Goal:
- 자주 쓰는 작업을 바로 시작할 수 있는 템플릿을 제공합니다.

Includes:
- 카테고리 템플릿
- 역할 템플릿
- 용도별 템플릿
- 예시와 모범 사례

Done when:
- 빈 입력 대신 바로 쓸 수 있는 템플릿이 준비됩니다.

## Phase 6. Sharing And Collaboration

Status: pending

Goal:
- 좋은 프롬프트를 사람이나 팀 단위로 재사용할 수 있게 합니다.

Includes:
- 프롬프트 공유
- 팀 라이브러리
- 즐겨찾기
- 추천 컬렉션

Done when:
- 저장한 프롬프트를 다른 사람과 쉽게 공유할 수 있습니다.

## Free Product Rule

- 무료 플랜은 Phase 0~5까지 사용할 수 있어야 합니다.
- 협업 기능은 비용이 들면 선택적으로 제한해도 됩니다.
- 새 기능은 머지 전에 해당 phase 문서에 먼저 기록합니다.

## Recent Work

- 프롬프트 품질 분석기에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 강화했습니다.
- 생성 프롬프트에 전략적 안내 블록을 추가했습니다.
- 관리자 대시보드를 프로젝트 맞춤 카드 레이아웃으로 재구성했습니다.
- 히스토리 화면을 탭 전환 중심으로 바꿔 긴 스크롤을 줄였습니다.
- 홈 히어로 레이아웃, 빠른 흐름 안내, AI 스타일 패널 높이를 조정했습니다.

## Recent UI Work

- 공통 surface 토큰을 버튼과 카드에 적용했습니다.
- 버튼과 패널의 라이트/다크 모드 대비를 다시 맞췄습니다.
- 모바일에서 섹션 간 여백이 너무 커 보이지 않도록 조정했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 구조를 `System / Template / User Input`으로 분리했습니다.
- complexity가 낮으면 간단 템플릿, 높으면 구조화된 템플릿을 사용하도록 정리했습니다.
- 최종 검증과 추가 입력 구조를 다시 맞췄습니다.

## Recent History UI Work

- 히스토리 카드에서 버전을 탭으로 전환할 수 있게 했습니다.
- 선택한 버전을 기준으로 불러오기와 복사가 동작합니다.
- 이전 버전 탐색을 아래로 스크롤하지 않도록 바꿨습니다.
