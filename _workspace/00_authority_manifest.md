# 권한 및 실행 매니페스트

- 상태: `completed`
- 이슈: `#7 [수정] Node 버전과 npm 의존성 취약점 정비`
- 통합 브랜치: `fix/7-node-dependency-security`
- 시작 SHA: `6a773282edc65ded2227df2da795f0597e87603a`
- 시작 시각: `2026-07-02T22:45:11.3670000+09:00`
- deadline: `2026-07-02T23:45:11.3670000+09:00`
- 누적 수정 시도: `1/2`
- 같은 SHA 수정 상한: `1회`
- 실행당 이슈: `1/1`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 |
|---|---|---|
| 이슈 생성 | allowed | 기존 이슈 #7만 사용 |
| push | allowed | `fix/7-node-dependency-security`, 1회 |
| PR | allowed | `dev` 대상, 1회 |
| merge | allowed | 성공한 CI와 검토 후 squash merge, 1회 |
| close | allowed | 이슈 #7, 1회 |
| deploy | denied | 모든 환경 |

## 보존 근거

- 직전 완료 실행: `_workspace_prev/20260702-224511/`

## 수정 시도 기록

1. `2d42ed6` 품질 검토에서 Jenkins Runtime stage가 npm 설치보다 앞서는 순서 회귀 검사가 누락되어 원 소유자에게 반환

## 완료 근거

- 마지막 구현 SHA: `3e065a21e6225e888a0420155f876a85d3802bb2`
- Node.js `22.23.1` clean install 엔진 경고 없음, npm audit `0`
- root·Spring·React·governance·harness 기계 검증 통과
- guardian `FAIL`, challenger `UNVERIFIED` 불일치를 judge가 환경 오염 증거와 Seed 명령 기준으로 `PASS` 판정
- push·PR·CI·merge는 본 완료 commit 이후 허용 범위에서 수행
