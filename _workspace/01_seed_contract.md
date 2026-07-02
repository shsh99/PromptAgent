# 이슈 #7 실행 Seed

- 계약 해시: sha256:e351de2677a8fa3e5fc387b16f2d8c9cc6c593275fd6790b80f8d35c019b81a5
- 사용자 승인: `2026-07-02 진행해`
- 기준 SHA: `6a773282edc65ded2227df2da795f0597e87603a`

## 목표와 사용자 가치

개발·CI Node.js 기준을 22로 일치시키고 root npm 공급망 취약점 9건을 호환성 파괴 없이 제거하거나 근거와 함께 명시적으로 수용한다.

## 범위

- 저장소의 로컬 Node 버전 선택 파일과 관련 운영 문서를 Node.js 22로 고정한다.
- root `package.json`과 lockfile의 Hono·Vite·Wrangler 및 필요한 전이 의존성을 강제 업데이트 없이 안전 버전으로 갱신한다.
- 취약점별 조치 결과, 호환성 영향과 검증 근거를 변경 문서에 기록한다.

## 비목표

- `npm audit fix --force`를 사용하지 않는다.
- 제품 기능, Spring·React API, DB 스키마와 배포 환경을 변경하지 않는다.
- 시스템 전역 Node 설치를 자동 변경하지 않는다.
- 별도 major 업그레이드는 안전한 최소 변경으로 해결되지 않을 때 amendment 승인 없이 수행하지 않는다.

## 소유 경계

- dependency 구현자는 root Node·npm 설정과 lockfile만 소유한다.
- governance 구현자는 CI·Jenkins·운영 문서의 버전 계약만 소유한다.
- qa-migration은 root·Spring·React 회귀와 audit 결과를 독립 검토한다.

## 완료 조건

1. 저장소 선택 파일, `package.json`, GitHub Actions, Jenkins 문서가 Node.js 22 계약으로 일치한다.
2. Node.js 22 이상에서 install 시 엔진 경고가 없다.
3. `npm audit --audit-level=low`가 0건으로 통과하거나 해결 불가능 항목마다 영향·수용 근거가 변경 문서에 기록된다.
4. root 테스트·빌드, governance·harness, Spring 테스트·bootJar, React 테스트·TypeScript·Vite build가 통과한다.
5. `docs/changes/` 문서와 PR이 이슈 #7을 연결한다.

## 권한·보안 위험

- package install script 실행과 lockfile 변화는 child worktree로 격리한다.
- major·강제 업데이트, 전역 설치, 배포는 금지한다.
- audit 출력에는 비밀값이나 환경변수를 기록하지 않는다.

## 검증 명령

```powershell
npx -y node@22 npm ci
npx -y node@22 npm audit --audit-level=low
npx -y node@22 npm test
npx -y node@22 npm run build
npx -y node@22 npm run test:governance
npx -y node@22 npm run test:harness
backend/gradlew.bat -p backend clean test bootJar
npx -y node@22 node frontend/node_modules/vitest/vitest.mjs run
npx -y node@22 node frontend/node_modules/typescript/bin/tsc -b --pretty false
npx -y node@22 node frontend/node_modules/vite/bin/vite.js build
git diff --check
```
