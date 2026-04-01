# PromptBuilder Plan

## Goal

Turn PromptBuilder from a prompt generator into a prompt improvement tool that can be used for free.

## Scope

- prompt generation
- prompt analysis
- model-specific optimization
- version management
- result feedback
- template library
- starter examples and prompt helpers
- light collaboration support

## Execution Priority

1. Result 3 variants
2. Optimize entry
3. Compare and history
4. Intent engine
5. Explanation layer
6. Admin analytics

## Constraints

- Free core must remain usable.
- Avoid mandatory paid model calls.
- Prefer local storage for MVP features.
- Keep the UI simple enough to use immediately.

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

1. Result 3 variants
2. Optimize entry
3. Compare and history
4. Intent engine
5. Explanation layer
6. Quality analyzer refinements
7. Admin analytics
8. Template library
9. Starter examples and helpers
10. Sharing and collaboration

## Recent Work

- Strengthened the prompt quality analyzer with problem framing, input data, reasoning guidance, examples, and recovery-path checks.
- Added a strategic guidance block to generated prompts before the final verification block.
- Updated the docs and changelog so the current implementation state is recorded together.
- Reworked the admin dashboard into a project-specific card layout with sidebar tab switching.
- Separated light and dark mode tokens for admin buttons, badges, and cards to improve readability.
- Updated the history dashboard so tabs switch sections instead of relying on long scrolling.
- Refined the home hero layout, moved the quick-flow guide into the mode panel, and aligned the AI style panel height with the left column.

## Phase Ownership

- Product logic: `webapp/src/features/prompt/*`
- API behavior: `webapp/src/app/routes.ts`
- App bootstrap: `webapp/src/app/bootstrap.tsx`
- Rendering: `webapp/src/app/renderer.tsx`
- UI flow: `webapp/public/static/features/*`
- Documentation: `docs/*.md`

## Definition Of Done

- The feature is usable without manual explanation.
- The free path works end to end.
- The docs explain the behavior and storage model.
- Existing flows still work after the change.
- Phase and changelog notes are updated in the same change.

## UI / UX Update

- 공통 surface 토큰을 홈 히어로, 템플릿 카드, 퀵 스타트 카드에 적용했습니다.
- 반응형 밀도 규칙으로 작은 화면에서의 답답함을 줄이고 데스크톱 간격은 유지했습니다.

## Recent Prompt Layer Work

- 프롬프트 생성 레이어를 `System / Template / User Input`으로 분리했습니다.
- 복잡도에 따라 `low`는 간단 템플릿, `high`는 확장 템플릿을 사용하도록 정리했습니다.
- 토큰 최적화를 위해 최종 검증과 추가 입력 구성을 복잡도별로 줄였습니다.

## Recent History UI Work

- 히스토리 카드에서 버전을 탭으로 전환할 수 있도록 바꿨습니다.
- 선택된 버전을 기준으로 불러오기와 복사가 동작하도록 정리했습니다.
- 세로 스크롤 대신 카드 내부 탭으로 이전 버전을 보는 구조로 정리했습니다.
