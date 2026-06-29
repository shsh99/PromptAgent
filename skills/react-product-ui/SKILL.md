---
name: react-product-ui
description: Use when React product screens, components, hooks, interactions, responsive states, accessibility, or frontend performance are created, 재실행, 업데이트, 수정, fixed, migrated, or reviewed.
---

# React Product UI

## 개요

제품 계약을 분명한 상태 모델과 접근 가능한 상호작용으로 구현한다. 시각 완성도, 성능, 유지보수성을 별도 후처리가 아닌 같은 완료 조건으로 다룬다.

## 필수 보조 스킬

작업 전에 설치된 다음 스킬을 함께 읽고 적용한다.

- `frontend-design-principles`: 제품 UI의 타이포그래피·색·공간 체계
- `frontend-design`: 독창적이고 완성도 높은 화면 구성
- `composition-patterns`: 확장 가능한 React 합성 API
- `react-best-practices`: React 성능과 데이터 흐름
- `accessible-ui-guidelines`: 접근성·사용성 구현
- `web-design-guidelines`: 최종 UI·UX 감사

충돌 시 프로젝트 계약과 기존 디자인 시스템을 우선하고 판단을 결과에 기록한다.

## 입력

이슈, 사용자 흐름, API 계약, 기존 디자인 토큰·컴포넌트, 허용 경로, 이전 UI 산출물을 읽는다.

## 워크플로우

1. 성공·로딩·빈 상태·오류·권한·모바일 상태를 먼저 표로 만든다.
2. API 응답과 훅 타입의 필드명·선택성·상태 전이를 교차 확인한다.
3. 기능 단위로 component/hook/model/page 책임을 나누고 합성 가능한 API를 사용한다.
4. 키보드, 포커스, 레이블, 대비, reduced motion, 터치 목표를 구현한다.
5. 불필요한 waterfall·재렌더·큰 번들을 피하고 실제 사용자 경로를 테스트한다.

## 출력

UI 코드·테스트와 `_workspace/03_react-ui_result.md`에 상태표, API 매핑, 접근성·반응형·성능 검증, 시각 위험을 기록한다.

## 이전 산출물 개선

기존 상태표·사용자 피드백·시각 위험을 먼저 읽는다. 요청된 화면 상태와 관련 테스트만 개선하고, 나머지 접근성·반응형 상태는 회귀 기준으로 유지한다.

## 검증

관련 테스트와 빌드를 실행하고 키보드 흐름, 포커스, 오류 복구, 좁은 viewport를 확인한다. `web-design-guidelines`로 최종 감사하고 API shape를 qa-migration과 교차 검증한다.

## 테스트 시나리오

- **정상 흐름:** 검색 결과 화면이 로딩·빈 상태·성공을 반응형으로 표시하고 키보드 탐색, 타입 검사, 테스트, 빌드가 통과한다.
- **오류 흐름:** API가 선택 필드를 누락한다. 훅과 계약 불일치를 보고하고 화면은 접근 가능한 복구 상태를 제공하며 백엔드 shape를 임의 추정하지 않는다.

## 흔한 실수

- 행복 경로만 구현: 상태표의 모든 행을 완료 조건으로 둔다.
- boolean prop 누적: composition-patterns로 역할 기반 API를 설계한다.
