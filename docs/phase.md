# PromptBuilder Phase Roadmap

## Current Priority

1. 결과 3개 생성
2. Optimize
3. Compare / 히스토리
4. Intent Engine
5. 설명 기능
6. 관리자 분석
7. 데이터 분석

## Phase 0. Docs And Agent Scaffold

Status: `completed`

Goal:
- establish a consistent working contract for future changes

Done when:
- `AGENT.md` exists
- `docs/README.md` exists
- `docs/plan.md` exists
- `docs/phase.md` exists

## Phase 1. Prompt Quality Analyzer

Status: `completed`

Goal:
- explain why a prompt is weak, not only score it

Includes:
- ambiguity detection
- missing role detection
- problem definition detection
- input data detection
- reasoning guidance detection
- example detection
- missing constraints detection
- output structure detection
- token waste hints
- failure reason suggestions
- model-specific hints

Done when:
- users can see the problem areas and suggested fixes

Work docs:
- `docs/tasks/phase-1/design.md`
- `docs/tasks/phase-1/plan.md`
- `docs/tasks/phase-1/plan-01-analyzer-core.md`
- `docs/tasks/phase-1/plan-02-suggestions.md`
- `docs/tasks/phase-1/plan-03-model-hints.md`
- `docs/tasks/phase-1/plan-04-ui-logging.md`
- `docs/tasks/phase-1/plan-05-content-architecture.md`

## Phase 2. Prompt Versioning And Optimize Loop

Status: `in_progress`

Goal:
- generate multiple prompt variants
- let users optimize the result immediately
- let users save v1, v2, v3 and compare them

Includes:
- result 3 variants
- optimize mode
- prompt runner
- output evaluator
- version save
- version restore
- diff view
- version labels
- history review

Current focus:
- result 3 variants
- optimize entry
- compare and history flow

Done when:
- users can compare two versions without leaving the app
- users can complete one full optimize loop
- users can move from generated result to optimization in one click

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

Status: `pending`

Goal:
- infer user intent and explain why a recommendation or prompt shape was chosen

Includes:
- intent parsing
- explanation blocks
- reason labels
- suggestion rationale

Done when:
- a user can understand why the app recommended a mode or structure

## Phase 4. Admin And Analytics

Status: `pending`

Goal:
- analyze usage and prompt quality from a management view
- present the dashboard as a readable card-based workspace with sidebar tabs

Includes:
- admin dashboard
- daily usage trend
- prompt type distribution
- result variant selection patterns
- export and audit
- light and dark mode token consistency
- section switching instead of long vertical scrolling
- project-specific dashboard labels and copy
- readable sidebar navigation for tab switching

Recent work:
- admin dashboard was rewritten into a card-based workspace with a sidebar menu and top KPI cards
- theme tokens for light and dark mode were separated so button text stays readable
- section switching now happens by tab selection instead of long vertical scrolling

Done when:
- an admin can see what users do and what should be improved next

## Phase 5. Template Library

Status: `pending`

Goal:
- provide reusable prompts for common real-world tasks

Includes:
- category templates
- role templates
- use-case templates
- examples and best practices

Done when:
- users can start from a known-good template instead of a blank form

## Phase 6. Sharing And Collaboration

Status: `pending`

Goal:
- make high-quality prompts reusable across people and teams

Includes:
- prompt sharing
- team library
- favorites
- best prompt collections

Done when:
- a saved prompt can be shared and reused by others

## Free Product Rule

- The free plan should cover phases 0 to 5 without requiring paid APIs.
- Collaboration can stay optional or limited if persistence costs are needed.
- Any new feature should be documented in the matching phase section before merging.

## Recent Work

- 프롬프트 품질 분석에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 추가했습니다.
- 생성된 프롬프트에 최종 검증 블록 전에 전략 가이드 블록을 넣도록 했습니다.
- 이번 작업이 문서와 변경 로그에 함께 기록되도록 정리했습니다.

## Recent UI Work

- 카드와 버튼에 공통 surface 토큰을 적용해서 라이트/다크 모드 톤을 일관되게 맞췄습니다.
- 모바일에서 간격과 그리드 밀도를 조정해 템플릿/빌더 흐름이 덜 빽빽하게 보이도록 했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 레이어를 `System / Template / User Input`으로 분리했습니다.
- 복잡도에 따라 `low`는 간단 템플릿, `high`는 확장 템플릿을 사용하도록 정리했습니다.
- 최종 검증과 사용자 입력 구성을 복잡도별로 나누어 토큰 사용량을 줄였습니다.

## Recent History UI Work

- 히스토리 카드에서 버전을 탭으로 전환할 수 있도록 바꿨습니다.
- 선택된 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.
- 이전 버전을 세로 스크롤로 찾지 않도록 카드 내부 탭 전환 UX를 추가했습니다.
