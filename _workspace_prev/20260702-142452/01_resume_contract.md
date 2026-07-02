# 새 실행 재개 계약

## 재사용 범위

- 승인된 설계와 구현 계획, Task 1~3 통합 결과를 유지한다.
- Task 4 후보의 구조·corpus·agent 독립성·validator 통과 결과를 재사용한다.
- 수정은 독립 검토에서 확인된 상태 전이 2건으로 제한한다.

## 확인된 원인

1. 적대적 검증 스킬 문구가 기계 실패를 `UNVERIFIED`로 종료해 결정 모듈의 `RETURN_TO_OWNER`와 충돌한다.
2. judge 입력 오류를 `UNVERIFIED`로만 반환해 설계의 판정자 실패 `blocked` 전이를 보장하지 않는다.

두 결함은 문서·agent 계약을 validator가 직접 검사하지 않아 구조 테스트가 통과한 채 남았다. 새 validator 회귀를 먼저 실패시킨 뒤 최소 문구 수정으로 통과시킨다.

## 검증 순서

1. 후보 commit에서 두 계약 누락을 재현한다.
2. validator에 상태 전이 token 계약을 추가해 RED를 확인한다.
3. 스킬과 judge 정의를 최소 수정해 GREEN을 확인한다.
4. 독립 명세 검토와 품질 검토를 모두 통과한 commit만 integration에 반영한다.
