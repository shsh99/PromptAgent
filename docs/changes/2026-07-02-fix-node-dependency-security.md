# Node 버전과 npm 의존성 취약점 정비

## PR 정보

- 관련 이슈: #7
- 대상 브랜치: `dev`
- 작업 브랜치: `fix/7-node-dependency-security`
- 종료 조건: `Closes #7`

## 작업 목적

로컬 선택 파일, 패키지 engine, GitHub Actions와 Jenkins의 Node.js 기준을 22로 일치시키고 root npm audit 취약점 9건을 강제·major 업데이트 없이 제거한다.

## 변경 내용

- `.nvmrc`에 Node.js 22를 고정하고 Jenkins가 Checkout 직후 실제 major를 검사하도록 했다.
- Hono를 `4.12.27`, Vite를 `6.4.3`, Wrangler를 `4.106.0` 안전 범위로 갱신했다.
- lockfile이 안전한 Miniflare, Undici, ws, esbuild, Hono Node Server와 PostCSS 전이를 선택하도록 갱신했다.
- Jenkins Runtime 검사가 Governance와 최초 `npm ci`보다 앞서는지 결정적 테스트로 고정했다.

## 영향 범위

root Node 개발 도구와 Jenkins 사전 검사에만 영향을 준다. Spring·React 제품 계약, API, DB 스키마와 배포 대상은 변경하지 않는다. Windows에서 `.nvmrc`는 자동 전환하지 않으므로 개발자는 Node 버전 관리자로 22를 활성화한 뒤 `npm`을 실행해야 한다.

## 테스트 결과

- Node.js `22.23.1`로 root `npm ci`를 실행했으며 엔진 경고 없이 완료됐다.
- `npm audit --audit-level=low`: 기존 9건에서 0건으로 감소했다.
- root 테스트·빌드, governance `34/34`, 하네스 구조 검사가 통과했다.
- Spring `clean test bootJar`, React `23/23`, TypeScript와 Vite build가 통과했다.

## 배포 및 마이그레이션 영향

제품 배포와 데이터 마이그레이션은 없다. CI와 Jenkins agent는 Node.js 22를 제공해야 한다. 시스템 전역 Node 설치는 자동 변경하지 않는다.

## 위험 요소와 롤백

- audit 결과는 npm registry 시점에 따라 변하므로 PR CI에서 다시 확인하고 새 advisory는 별도 이슈로 추적한다.
- install script가 있는 빌드 도구는 격리 worktree의 clean install에서만 실행했고 배포 명령은 실행하지 않았다.
- 회귀 시 `package.json`과 `package-lock.json`을 함께 revert하고 `.nvmrc`·Jenkins·계약 테스트는 별도 commit 단위로 되돌린다.
- `npm audit fix --force`, overrides와 major 업그레이드는 사용하지 않았다.

## AI 사용

Codex 하네스가 audit 경로 분석, 비중첩 child worktree 구현, 독립 명세·품질 검토와 제한형 공격 시나리오 검증을 수행했다. 모든 버전과 결과는 Node.js 22의 실행 명령으로 재검증했다.

## 관련 문서

- [GitHub Actions 운영](../operations/github-actions.md)
- [Jenkins 운영](../operations/jenkins.md)
- [운영 런북](../operations/runbook.md)
- [Node 의존성 정비 Seed](../../_workspace/01_seed_contract.md)
