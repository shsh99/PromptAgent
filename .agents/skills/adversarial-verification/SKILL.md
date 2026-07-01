---
name: adversarial-verification
description: "Use when 재실행, 업데이트, 수정 결과를 PR 전에 독립 관점으로 교차 검토해야 하며, 단일 테스트 실행에는 사용하지 않음."
---

# 적대적 검증

기계 검증을 통과한 동일 SHA를 공격·보수·대안 관점에서 제한적으로 검토한다. 추론의 합의가 아니라 재현 가능한 증거와 승인 Seed의 완료 조건으로 판정한다.

## 입력

- 잠긴 Seed 또는 amendment와 완료 조건
- 검토 대상 SHA와 해당 diff
- 기계 검증 명령·결과, authority manifest
- 이전 cycle 보고서와 영향 시나리오(있는 경우)

## 워크플로우

1. 기계 검증 실패 또는 대상 SHA 불일치이면 공격·검토·판정을 호출하지 말고 `UNVERIFIED`로 정지한다.
2. `verification-cycle.mjs`가 허용한 시나리오만 만든다. 첫 cycle은 최대 10개, 둘째 cycle은 영향 시나리오 최대 5개이며 셋째 cycle은 만들지 않는다.
3. verification-attacker가 이전 불일치 패턴과 완료 조건의 경계를 공격하는 재현 시나리오를 작성한다. 증거 없는 가정을 결함으로 승격하지 않는다.
4. evidence-guardian과 solution-challenger를 같은 Seed·SHA·기계 결과로 독립 실행한다. 서로의 결과를 입력으로 전달하지 않는다.
5. 두 verdict가 같으면 judge를 호출하지 않는다. 두 verdict가 다를 때만 verification-judge가 두 보고서의 관찰 가능한 증거와 Seed를 비교한다. 숨겨진 추론은 요구하지 않는다.
6. 모든 다음 상태(`pass`, `retry`, `blocked`)는 `scripts/harness/verification-cycle.mjs` 결과를 따른다. 보고서나 관리자의 직관으로 우회하지 않는다.
7. 외부 쓰기 권한은 `_workspace/00_authority_manifest.md`에서만 읽는다. 누락·거부 권한을 추정하거나 확대하지 않는다.

## 출력

모든 역할은 다음 공통 필드를 빠짐없이 기록한다.

`입력 SHA / 검토한 완료 조건 / verdict(PASS|FAIL|UNVERIFIED) / 관찰 가능한 증거 / 재현 명령 / 남은 위험`

guardian·challenger 불일치 시 judge는 선택한 verdict와 반대 증거를 기각한 이유를 함께 기록한다. 비밀값, 원문 프롬프트, 개인정보, 숨겨진 추론은 기록하지 않는다.

## 검증

- 보고서의 입력 SHA가 현재 SHA와 같은지 확인한다.
- 기계 검증 성공 후에만 역할 보고서가 생성됐는지 확인한다.
- guardian과 challenger 입력에 상대 보고서가 없는지 확인한다.
- `node --test tests/harness/skill-trigger-contract.test.mjs`
- `node --test tests/harness/verification-cycle.test.mjs`
- `node tests/harness/validate-harness.mjs`
- `git diff --check`

## 테스트 시나리오

- **정상 흐름:** 기계 검증을 통과한 SHA에서 첫 cycle 10개 이하를 독립 검토하고 verdict가 같아 judge 없이 `pass`한다.
- **정상 흐름:** 둘째 cycle에서 변경 영향 시나리오 5개 이하만 검토하고 verdict 불일치를 judge가 증거로 판정한다.
- **오류 흐름:** 기계 검증 실패, SHA 불일치, 셋째 cycle 요청은 역할을 호출하지 않고 `UNVERIFIED` 또는 `blocked`로 종료한다.
- **오류 흐름:** 외부 쓰기 권한이 authority manifest에 없으면 검증 결과와 분리해 해당 쓰기를 정지한다.

## 이전 산출물 개선

이전 보고서를 덮어쓰지 않는다. 부분 재실행은 바뀐 SHA와 영향받은 완료 조건만 새 cycle 산출물에 기록하고, 이전 verdict·증거·재현 명령을 보존한다. 이전 보고서가 불완전하면 추정 보완하지 말고 `UNVERIFIED`와 누락 필드를 남긴다.

## 흔한 실수

- 기계 검증 실패를 리뷰로 보완: 검증 순서를 위반하므로 즉시 정지한다.
- 두 독립 검토 결과 공유: 상호 오염되므로 동일 입력만 각각 전달한다.
- 더 많은 시나리오가 안전하다고 가정: cycle 상한을 적용하고 초과분은 남은 위험으로 기록한다.
