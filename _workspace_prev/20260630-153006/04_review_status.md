# 이슈 #11 독립 검토 상태

## backend

- 후보 SHA: `7a74b14484d6dcb5a36074d5711595846bcc6fa5`
- 검증: 24개 테스트, `clean test bootJar`, diff·라인 검사 통과
- 상태: 최종 재검토 대기

## frontend

- 후보 SHA: `352cd7df51ad53638cfded1dbb278496e143563d`
- 검증: Node 22에서 16개 테스트, typecheck, build 통과
- 상태: 독립 검토 FAIL, 수정 예산 소진으로 미통합

## 미해결 검토 항목

1. 9개 항목을 6개 상위 그룹 구조로 렌더링한다.
2. 목록·상세 요청에 active sequence를 적용하고 stale 응답 테스트를 추가한다.
3. 목록·상세 parser가 unknown key와 목록 본문 누출을 거부한다.
4. page 상태와 이전·다음 이동을 URL에 반영하고 popstate로 복원한다.
5. 상세 loading 취소와 초점 이동·복귀를 완성한다.
6. 갱신 오류 재시도 버튼의 모바일 hit target을 44px 이상 보장한다.
