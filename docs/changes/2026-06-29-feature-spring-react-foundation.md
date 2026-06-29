# Spring Boot·React 프로젝트 기반 구축

## PR 정보

- PR 또는 MR: `dev` 대상 PR 생성 예정
- 관련 이슈: Closes #9
- 작성자·검토자: 관리자 오케스트레이터, Spring·React·QA 역할

## 작업 목적

기존 Hono 앱을 중단하지 않고 Spring Boot·React·PostgreSQL/pgvector 구조로 기능을 수직 이관할 수 있는 빌드·테스트 기반을 만든다.

## 변경 내용

- 사용자 동작: 세 핵심 기능의 진입점을 보여 주는 접근 가능한 React 앱 셸과 backend 연결 상태를 추가했다.
- 코드·설정·문서: Java 21·Spring Boot 3.5, OpenAPI, Actuator, React 19·Vite 8, pgvector Compose, CI/Jenkins 모듈 검증을 추가했다.
- 제외한 내용: 프롬프트 마켓 데이터, 상세 생성기, 에이전트 패키지 생성 로직은 후속 수직 기능 이슈에서 구현한다.

## 영향 범위

- 영향받는 모듈·인터페이스: 신규 `backend/`, `frontend/`, `/api/v1/system/health`, 로컬 DB 환경, CI/Jenkins.
- 호환성·성능·보안 영향: Java 21과 Node 22 이상이 필요하다. DB 비밀은 환경변수로만 받고 이미지 버전을 고정했다.

## 테스트 결과

- 실행한 명령: backend Gradle test·bootJar, frontend Vitest·typecheck·build, foundation·governance·harness·기존 앱 테스트와 빌드.
- 자동 테스트 결과: 로컬 검증 후 GitHub Actions에서 Linux·Node 22 기준으로 재검증한다.
- 수동 검증 결과: 데스크톱 브라우저에서 제목 구조, skip link, 핵심 기능 카드, API 오류 상태와 레이아웃을 확인했다.

## 배포 및 마이그레이션 영향

- 배포 순서와 조건: 현재 레거시 Pages 배포는 유지한다. 신규 frontend/backend는 후속 배포 이슈 전까지 CI 산출물만 만든다.
- 데이터·설정 마이그레이션: 실제 데이터 마이그레이션은 없다. 로컬 DB 시작 시 vector extension만 활성화한다.
- 관측 및 성공 기준: `/actuator/health`, `/api/v1/system/health`, `/v3/api-docs` 응답과 frontend 상태 표시를 기준으로 한다.

## 위험 요소와 롤백

- 알려진 위험과 완화 방안: 로컬 기본 Node가 20.17이므로 번들 Node 24와 CI Node 22로 검증하며 #7에서 개발 환경을 정리한다.
- 롤백 조건과 절차: 신규 모듈 실패 시 `backend/`, `frontend/`, Compose 및 조건부 CI 변경을 되돌리면 기존 앱은 영향 없이 유지된다.

## AI 사용

- 사용한 도구와 범위: Spring·React 설계, 테스트 우선 구현, 접근성 UI 검토와 브라우저 시각 검증에 사용했다.
- 사람이 검증한 내용: 버전 호환성, 공개 API 계약, 비밀값 경계, RED/GREEN 결과, 빌드 산출물을 확인했다.
- AI 리뷰 결과와 조치: PR의 읽기 전용 Codex 리뷰와 사람 검토 결과를 반영할 예정이다.

## 관련 문서

- 갱신한 문서: README, 모듈 구조, 배포 구조, API·OpenAPI 컨벤션.
- 후속 작업: 실제 프롬프트 마켓 첫 수직 기능과 배포 이미지·타입 생성 자동화.
