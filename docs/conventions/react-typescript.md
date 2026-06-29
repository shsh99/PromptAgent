# React·TypeScript 코드 컨벤션

## 목적

사용성, 접근성, 성능을 유지하는 프론트엔드 구현 기준을 정의한다.

## 적용 범위

`frontend/`의 React 컴포넌트, 훅, 상태, API 연동과 테스트에 적용한다.

## 함께 갱신할 문서

- [모듈 구조](../architecture/module-structure.md)
- [코드 크기 제한](code-size-limits.md)
- [테스트](testing.md)

## 구조

기능은 `src/features/<feature>/api`, `components`, `hooks`, `model`, `pages`로 나눈다. 서버 상태는 API 계층과 전용 쿼리 훅이 소유하고, URL로 공유해야 하는 필터·탭·세션 상태는 URL에 둔다. 전역 상태는 인증이나 테마처럼 진짜 전역인 값에만 사용한다.

## 작성 규칙

- TypeScript strict 모드를 유지하고 `any` 대신 검증된 `unknown`을 사용한다.
- 컴포넌트는 렌더링과 상호작용에 집중하고 업무 규칙은 순수 함수·훅으로 분리한다.
- boolean prop이 늘어나면 역할별 컴포지션이나 명시적 variant를 사용한다.
- 파생 상태를 별도 state로 복제하지 않고 렌더 중 계산한다.
- 비동기 화면은 로딩, 빈 상태, 부분 실패, 재시도, 완료 상태를 모두 제공한다.
- 시맨틱 HTML, 연결된 label, 키보드 초점, 오류 안내, 축소 모션을 기본으로 한다.
- 디자인 토큰과 공용 컴포넌트를 사용하며 기능 파일에 임의 색상·간격을 반복하지 않는다.
- 공개 API 응답은 런타임 스키마로 검증하고 OpenAPI 생성 타입과 일치시킨다.
