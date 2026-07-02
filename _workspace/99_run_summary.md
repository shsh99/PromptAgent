# 이슈 #7 실행 요약

## 계약

- Seed: `sha256:e351de2677a8fa3e5fc387b16f2d8c9cc6c593275fd6790b80f8d35c019b81a5`
- branch: `fix/7-node-dependency-security`
- target: `dev`
- 수정 예산: `1/2`

## fan-in commit

| 작업 | commit |
|---|---|
| 의존성 안전 패치 | `ce1a2ba` |
| Node 22 환경 계약 | `b36f78d` |
| Jenkins 순서 회귀 보강 | `ba24f5f` |
| 변경 문서·공격 시나리오 | `3e065a2` |

## 보안 결과

- audit: 높음 6·보통 2·낮음 1 → `0`
- direct: Hono `4.12.27`, Vite `6.4.3`, Wrangler `4.106.0`
- 주요 전이: Miniflare `4.20260630.0`, Undici `7.28.0`, ws `8.21.0`, Wrangler esbuild `0.28.1`, Hono Node Server `1.19.14`, PostCSS `8.5.16`
- force·major·overrides·배포: 없음

## 검증 결과

- Node `22.23.1` + npm CLI clean install: 엔진 경고 없음
- root audit·테스트·빌드: 통과
- governance `34/34`, harness: 통과
- Spring `clean test bootJar`: 통과
- React `23/23`, TypeScript, Vite build: 통과
- 적대적 검증: judge 최종 `PASS`
