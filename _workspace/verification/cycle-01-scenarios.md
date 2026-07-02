# 검증 cycle 1 공격 시나리오

- 입력 SHA: `ba24f5f221bbed6c1d248c37ddb96a5b09186bc9`
- 시나리오 수: `10/10`

1. Windows npm shim이 Node 20을 사용해 검증을 오염시키는지 확인한다.
2. `.nvmrc`, engines, Actions, Jenkins의 Node 22 계약 drift를 확인한다.
3. registry 시점 변화로 audit가 다시 실패하는지 확인한다.
4. clean install 후 lockfile과 integrity가 변하지 않는지 확인한다.
5. Jenkins Runtime 검사가 package 설치보다 먼저 실행되는지 확인한다.
6. install script 패키지 증가와 배포 부작용을 확인한다.
7. major, force, overrides가 숨겨지지 않았는지 확인한다.
8. root와 frontend install·검증이 분리되어 모두 통과하는지 확인한다.
9. 취약 esbuild가 root와 Wrangler 경로 중 어디에 있는지 확인한다.
10. 변경 문서와 `Closes #7` 연결을 확인한다.

초기 공격 판정의 문서 누락은 본 실행에서 보완했다. Node 실행기 오염은 Node 22 절대 실행 경로로 npm CLI를 호출해 clean install과 audit를 다시 수행한다. CI audit 상시 게이트는 승인 Seed의 완료 조건이 아니므로 이번 범위에 추가하지 않고 registry 시점 위험으로 기록한다.
