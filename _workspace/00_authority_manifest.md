# 이슈 #11 재실행 권한 매니페스트

- 상태: integration_verified
- 시작: 2026-06-30T15:30:06+09:00
- deadline: 2026-06-30T16:30:06+09:00
- 현재 integration SHA: 99281fd
- 승인 backend SHA: 7a74b14484d6dcb5a36074d5711595846bcc6fa5
- 승인 frontend SHA: b2d2d058ad3326f6d07d3eef1fdf9fec3f260726
- 누적 수정 시도: 2 / 2
- 실행당 이슈: #11 한 개
- 이전 실행: `_workspace_prev/20260630-153006/`

## 외부 쓰기 권한

| 작업 | 권한 | 범위 | 최대 횟수 | 만료 조건 |
|---|---|---|---:|---|
| 이슈 생성 | allowed | PromptAgent #11 기존 이슈 | 0 | 이 실행 종료 |
| push | allowed | `feat/11-prompt-market` | 2 | 이 실행 종료 |
| PR | allowed | 위 브랜치에서 `dev` 대상 | 1 | 이 실행 종료 |
| merge | allowed | checks 통과 후 squash merge | 1 | 이 실행 종료 |
| close | allowed | 병합 후 이슈 #11 | 1 | 이 실행 종료 |
| deploy | denied | 모든 환경 | 0 | 별도 사용자 승인 전 |

## 재실행 범위와 한도

- 이전 아키텍처 계약과 backend 승인을 재사용한다.
- frontend 독립 검토 6개 항목과 integration 교차 검증만 수행한다.
- 같은 SHA 수정은 최대 1회, 전체 수정은 최대 2회다.
- CI pending은 최대 20분이며 전체 deadline을 넘지 않는다.
- 승인된 다음 이슈는 없으므로 #11 종료 후 실행을 종료한다.

## 통합 검증 기록

- Backend: 전체 테스트와 실행 JAR 생성 성공
- Frontend: 6개 파일 23개 테스트, 타입 검사, 프로덕션 빌드 성공
- Browser: API 연결, 검색, 상세 6개 그룹·9개 항목, Clipboard 복사, 390px 반응형 확인
- 추가 코드 수정은 허용하지 않으며 문서·PR·CI·병합 단계만 진행한다.
