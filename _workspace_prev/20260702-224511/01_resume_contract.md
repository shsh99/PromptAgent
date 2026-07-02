# Task 5 재개 계약

Task 5 구현 내용은 유지한다. 이번 수정은 `tests/harness/validate-harness.mjs`의 project-orchestrator `워크플로우` 필수 token에 guardian과 challenger가 `서로의 결론을 보지 않고` 검토한다는 독립 입력 계약을 추가하는 것으로 제한한다.

validator RED를 먼저 확인하고 최소 token 추가 후 관련 36개 테스트, 하네스, diff 검사를 수행한다. 독립 명세·품질 검토를 통과해야 integration에 반영한다.
