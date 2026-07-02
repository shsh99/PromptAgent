# 이슈 #7 아키텍처 계약

## 기준과 결론

- 승인 Seed: `_workspace/01_seed_contract.md` (`sha256:e351de2677a8fa3e5fc387b16f2d8c9cc6c593275fd6790b80f8d35c019b81a5`)
- 기준 commit: `6a773282edc65ded2227df2da795f0597e87603a`
- 분석 런타임: Node.js `22.23.1`, npm `10.8.2`, 2026-07-02 npm registry
- 결론: 취약점 9건은 direct dependency의 허용된 patch/minor 범위 안에서 모두 제거할 수 있다. `--force`, major 업그레이드, `overrides`, 전역 설치와 취약점 수용 예외는 필요하지 않다.

## 현재 원인과 의존성 경로

잠금 파일에서 `npm audit --json`은 높음 6, 보통 2, 낮음 1, 총 9건으로 종료 코드 1을 반환한다.

| 잠긴 모듈 | 심각도 | 유입 경로 | 안전 경계 |
|---|---:|---|---|
| `hono@4.12.9` | 높음 | root direct | `>=4.12.25`; 현재 registry patch `4.12.27` |
| `vite@6.4.1` | 높음 | root direct | `>=6.4.3`; Vite 7/8 전환 불필요 |
| `wrangler@4.78.0` | 높음 | root direct | 취약 범위가 `4.64.0..4.101.0`; 현재 minor `4.106.0` |
| `miniflare@4.20260317.3` | 높음 | `wrangler -> miniflare` | `wrangler@4.106.0`이 안전 전이를 선택 |
| `undici@7.24.4` | 높음 | `wrangler -> miniflare -> undici` | `>=7.28.0` |
| `ws@8.18.0` | 높음 | `wrangler -> miniflare -> ws` | `>=8.21.0` |
| `esbuild@0.27.3` | 낮음 | `wrangler -> esbuild` | `>=0.28.1` |
| `@hono/node-server@1.19.11` | 보통 | `@hono/vite-dev-server -> @hono/node-server` | `>=1.19.13` |
| `postcss@8.5.8` | 보통 | `vite -> postcss` | `>=8.5.10` |

`npm audit fix --dry-run --json`은 package manifest를 강제로 바꾸지 않고 `hono@4.12.27`, `vite@6.4.3`, `wrangler@4.106.0`, `miniflare@4.20260630.0`, `undici@7.28.0`, `ws@8.21.0`, `esbuild@0.28.1`, `@hono/node-server@1.19.14`, `postcss@8.5.16` 선택이 가능함을 보였다. `npm outdated --json`의 manifest 범위 밖 항목은 `hono`뿐이며 wanted/latest가 모두 `4.12.27`이다. Vite 최신 `8.1.3`과 Hono Vite 플러그인 최신 major/minor는 이번 보안 패치에 필요하지 않아 제외한다.

## 최소 안전 업데이트 전략

1. dependency 구현자는 direct 최소 안전 범위를 `hono ^4.12.27`, `vite ^6.4.3`, `wrangler ^4.106.0`으로 올리고 Node 22에서 lockfile만 재생성한다.
2. `@hono/vite-build`와 `@hono/vite-dev-server` manifest 범위는 변경하지 않는다. 현 범위가 안전한 `@hono/node-server`를 선택하므로 불필요한 플러그인 업그레이드를 피한다.
3. governance 구현자는 저장소 선택 파일 `.nvmrc`에 `22`를 고정하고, CI·Jenkins의 실제 Node major가 22인지 결정적 계약 테스트와 실행 전 진단으로 보강한다. 기존 GitHub Actions 두 workflow는 이미 `node-version: 22`, root/frontend `engines`는 이미 `>=22`다.
4. Node 22가 활성화된 셸에서 clean install, audit, 전체 회귀를 실행한다. Seed의 `npx -y node@22 npm ...` 형식은 `node@22` 실행기가 `npm`을 스크립트 경로로 해석해 실패하므로 사용하지 않는다. `.nvmrc`를 지원하는 버전 관리자 또는 CI `setup-node`로 Node 22를 활성화한 뒤 일반 `npm` 명령을 사용한다.

## 정확한 파일 소유 경계

### dependency 구현자

- `package.json`
- `package-lock.json`

다른 package, frontend lockfile, workflow, 문서, 테스트는 수정하지 않는다.

### governance 구현자

- `.nvmrc` (신규)
- `Jenkinsfile`
- `tests/governance/workflows.test.mjs`
- `tests/governance/ai-jenkins.test.mjs`
- `docs/operations/github-actions.md`
- `docs/operations/jenkins.md`
- `docs/operations/runbook.md`

GitHub workflow의 `node-version: 22`는 이미 충족되므로 `.github/workflows/*.yml`은 기본적으로 변경하지 않는다. 테스트가 실제 불일치를 증명할 때만 architecture amendment 후 소유 범위를 넓힌다. 최종 변경 문서 `docs/changes/2026-07-02-fix-node-dependency-security.md`는 통합 소유자가 작성한다.

## TDD와 RED 근거

- dependency RED: 기준 lockfile에서 Node 22/npm 10.8.2의 `npm audit --audit-level=low`가 9건과 종료 코드 1을 반환한다. 이는 네트워크 기반 보안 acceptance test이며 구현 후 0건이어야 한다.
- governance RED: `.nvmrc`가 없으므로 로컬 선택 파일 계약이 실패한다. 먼저 `workflows.test.mjs`에 `.nvmrc === "22"`, root/frontend engine, 두 Actions workflow의 Node 22 일치를 검사하는 테스트를 추가해 실패를 확인한다.
- Jenkins RED: 문서에는 Node 22 agent 요구사항이 있지만 Pipeline 자체에 runtime major 진단·fail-fast가 없다. 먼저 `ai-jenkins.test.mjs`에 Node major 22 preflight 계약을 추가해 실패시킨다.
- audit은 registry 상태에 의존하므로 일반 unit suite에 넣지 않고 CI/acceptance 증거로 실행한다. 단위 테스트는 버전 계약과 구성 drift만 결정적으로 검사한다.

## 검증 명령

Node 22가 활성화된 셸에서 다음 순서로 실행한다.

```powershell
node --version
node -e "if (Number(process.versions.node.split('.')[0]) !== 22) process.exit(1)"
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:governance
npm run test:harness
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
backend/gradlew.bat -p backend clean test bootJar
git diff --check
```

추가 점검:

```powershell
npm ls hono vite wrangler miniflare undici ws esbuild @hono/node-server postcss
npm audit fix --dry-run --json
```

dry-run은 실제 수정 명령이 아니라 registry 변화와 해결 경로를 재확인하는 증거로만 사용한다.

## 롤백

- child commit이 QA 전이면 integration에 cherry-pick하지 않고 해당 worktree를 보존한다.
- dependency 회귀 시 `package.json`과 `package-lock.json`을 한 commit 단위로 함께 revert한다. lockfile만 부분 복원하지 않는다.
- governance 회귀 시 `.nvmrc`, Jenkins preflight, 관련 테스트·문서를 한 commit 단위로 revert한다.
- 이미 PR에 반영됐다면 강제 push나 reset 대신 한글 revert commit/PR을 사용하고, 이전 lockfile로 `npm ci`, audit, build를 다시 실행한다.
- audit 0건을 만들 수 없는 새 advisory가 등장하면 임의 override하지 않고 영향·완화·만료일을 포함한 Seed amendment 승인을 받는다.

## 병렬화 판단

dependency와 governance는 파일 소유가 겹치지 않고 RED도 각각 audit과 구성 계약으로 독립적이므로 architecture 승인 후 병렬 실행할 수 있다. 다만 최종 audit과 전체 회귀는 두 commit을 dependency order로 통합한 뒤 단일 integration worktree에서 순차 실행한다. frontend package는 분석 입력일 뿐 수정 대상이 아니다.
