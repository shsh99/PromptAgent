# PromptBuilder Plan

## Goal

PromptBuilder를 단순한 프롬프트 생성기가 아니라, 결과를 비교하고 개선하는 도구로 발전시킵니다.

## Scope

- prompt generation
- prompt analysis
- model-specific optimization
- version management
- result feedback
- template library
- starter examples and helper templates
- light collaboration support

## Execution Priority

1. 결과 3개 생성
2. Optimize 진입
3. Compare and history
4. Intent engine
5. Explanation layer
6. Admin analytics

## Constraints

- 무료 핵심 기능은 계속 사용 가능해야 합니다.
- 유료 모델 호출은 필수 조건이 되면 안 됩니다.
- MVP는 local-first 저장을 우선합니다.
- UI는 바로 이해할 수 있을 만큼 단순해야 합니다.

## Current Baseline

Already present:
- prompt generation
- prompt improvement
- basic quality report
- library save/load
- history logging
- context-engineering flow
- 3-result generation
- result-screen Optimize entry
- training sample persistence
- admin sample CSV export

Missing or incomplete:
- ambiguity analysis
- token waste analysis
- output schema
- model-aware rewriting
- result compare workflow
- full compare mode
- runner flow
- output evaluation
- prompt version diff
- test/run loop
- result feedback ingestion
- template library
- starter examples and helper templates

Recently applied:
- problem framing
- input data design
- reasoning guidance
- evaluation criteria
- example-based learning
- recovery prompts

## Execution Order

1. 결과 3개 생성
2. Optimize 진입
3. Compare and history
4. Intent engine
5. Explanation layer
6. Quality analyzer refinements
7. Admin analytics
8. Template library
9. Starter examples and helpers
10. Sharing and collaboration

## Recent Work

- 프롬프트 품질 분석기에 문제 정의, 입력 데이터, 추론 방향, 예시, 복구 경로를 추가했습니다.
- 생성 프롬프트에 전략적 안내 블록과 최종 검증 블록을 정리했습니다.
- 문서와 changelog를 최신 구현 상태에 맞게 다시 정리했습니다.
- 관리자 대시보드를 카드형 워크스페이스로 개편했습니다.
- 라이트/다크 토큰을 분리해 버튼과 카드 가독성을 개선했습니다.
- 히스토리를 탭 전환 중심으로 정리했습니다.
- 홈 히어로 레이아웃, 빠른 흐름 안내, AI 스타일 패널 높이를 다듬었습니다.

## Phase Ownership

- Product logic: `webapp/src/features/prompt/*`
- API behavior: `webapp/src/app/routes.ts`
- App bootstrap: `webapp/src/app/bootstrap.tsx`
- Rendering: `webapp/src/app/renderer.tsx`
- UI flow: `webapp/public/static/features/*`
- Documentation: `docs/*.md`

## Definition Of Done

- 기능을 따로 설명하지 않아도 사용할 수 있어야 합니다.
- 무료 경로가 끝까지 동작해야 합니다.
- 문서가 동작과 저장 구조를 설명해야 합니다.
- 변경 이후 기존 흐름이 깨지지 않아야 합니다.
- phase와 changelog가 같은 변경 세트에서 갱신되어야 합니다.

## UI / UX Update

- 공통 surface 토큰을 버튼과 카드에 적용했습니다.
- 반응형 여백과 텍스트 밀도를 다시 맞췄습니다.
- 상단 히어로, 모드 선택, AI 스타일, 통계 카드가 서로 더 자연스럽게 이어지도록 조정했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 레이어를 `System / Template / User Input`으로 분리했습니다.
- complexity에 따라 간단 템플릿과 확장 템플릿을 나눴습니다.
- 최종 검증과 추가 입력 구조를 더 명확하게 맞췄습니다.

## Recent History UI Work

- 히스토리 카드에서 이전 버전을 탭으로 바로 볼 수 있게 했습니다.
- 선택한 버전을 기준으로 불러오기와 복사가 동작합니다.
- 긴 스크롤 대신 카드 내부 전환으로 탐색하게 바꿨습니다.
