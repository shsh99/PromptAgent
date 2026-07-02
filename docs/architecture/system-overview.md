# 전체 시스템 아키텍처

## 목적

제품 경계와 핵심 기술 결정을 한눈에 설명한다.

## 적용 범위

신규 기능 설계, 모듈 경계 검토, 기술 도입 판단에 적용한다.

## 함께 갱신할 문서

- [모듈 구조](module-structure.md)
- [데이터 흐름](data-flow.md)
- [배포 구조](deployment.md)

## 구성

사용자는 독립 React·TypeScript 애플리케이션을 통해 `/api/v1` REST API를 호출한다. Spring Boot 모듈형 모놀리스가 업무 규칙과 AI 오케스트레이션을 수행하며 PostgreSQL과 pgvector에 정형 데이터와 내부 지식을 저장한다. 외부 채팅·임베딩 모델과 웹 검색은 교체 가능한 게이트웨이 뒤에 둔다.

```text
사용자 -> React -> REST/OpenAPI -> Spring Boot -> PostgreSQL/pgvector
                                      |-> AI 모델
                                      `-> 웹 검색 제공자
```

제품 기능은 프롬프트 마켓, 상세 생성기, 에이전트 추천기다. 초기에는 마이크로서비스로 분리하지 않으며 기존 `webapp/`은 기능별 동등성 검증이 끝날 때까지 유지한다.

## 개발 하네스

프로젝트 변경은 제품 런타임과 분리된 Codex 저장소 하네스로 관리한다. 구현 전에 `spec-crystallization`이 이슈, 범위, 완료 조건, 검증 명령을 `_workspace/01_seed_contract.md`에 기록하고 사용자 승인 뒤 SHA-256 해시로 고정한다. 승인된 Seed의 본문은 직접 수정하지 않으며 범위 변경은 별도 amendment와 재승인으로 추적한다.

integration 단계에서는 테스트·빌드·정적 규칙·diff 검사를 먼저 수행한다. 기계 검증이 통과한 경우에만 `adversarial-verification`이 공격 시나리오를 만들고, 증거를 보수적으로 판정하는 guardian과 대안을 탐색하는 challenger가 서로의 결론 없이 독립 검토한다. 두 verdict가 다를 때만 judge가 Seed와 관찰 가능한 증거를 비교한다.

```text
한글 이슈 -> 승인·해시 고정 Seed -> 역할별 구현·incremental QA
         -> integration 기계 검증 -> 공격 시나리오
         -> guardian ─┐
                      ├─ 일치: 다음 상태 / 불일치: judge
            challenger ┘
         -> PR checks -> squash merge -> dev 동기화
```

검증은 첫 cycle 10개, 둘째 cycle 신규 5개, 실행 전체 15개 시나리오로 제한한다. 같은 실패가 두 cycle 연속 반복되거나 총 수정 2회, SHA별 수정 1회, 60분 deadline 중 하나에 도달하면 fail-closed로 중단한다. 하네스는 Ouroboros와 OMC의 Seed 고정·독립 검토·동일 실패 중단 패턴만 선택 적용하며 외부 실행 런타임이나 Claude 전용 플러그인을 설치하지 않는다.

## 품질 속성

- 보안: 최소 권한, 입력 검증, RAG 비신뢰 컨텍스트 격리, 민감정보 로그 금지
- 신뢰성: 규칙 기반 폴백, 외부 호출 제한 시간·재시도·비용 한도
- 추적성: `traceId`, 모델·템플릿 버전, 검색 출처와 품질 지표 기록
- 접근성: 키보드, 스크린리더, 고대비, 축소 모션 지원
