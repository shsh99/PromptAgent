# 이슈 #11 React 프롬프트 마켓 구현 결과

## 상태표

| 영역 | 상태 | 검증 |
| --- | --- | --- |
| 목록 API 런타임 검증 | 완료 | 정상·필수 필드 누락 테스트 |
| 상세 API 런타임 검증 | 완료 | 6개 그룹·9개 필수 항목·복사 본문 검사 |
| 검색·필터 | 완료 | category·difficulty·query AND 요청 및 URL 반영 |
| 목록 상태 | 완료 | 최초/갱신 로딩, 성공, 빈 결과, 오류, 재시도 |
| 상세 상태 | 완료 | 로딩, 성공, 404, 일반 오류, 닫기 |
| 프롬프트 복사 | 완료 | Clipboard resolve/reject 기준 성공·실패 분리 |
| 반응형 UI | 완료 | 3열→2열→1열, 모바일 44px 입력·버튼, 긴 본문 대응 |
| 회귀 검증 | 완료 | frontend 전체 16개 테스트, 타입 검사, 빌드 통과 |

## API 매핑

- `GET /api/v1/prompt-templates`: `category`, `difficulty`, `query`, `page=0`, `size=20`을 `URLSearchParams`로 직렬화한다.
- 목록 응답은 카드 메타데이터만 허용하고 enum, 검증 상태, 페이지 수치를 런타임에 검사한다.
- `GET /api/v1/prompt-templates/{templateId}`: ID를 URL 인코딩하고 상세의 6개 상위 그룹과 9개 말단 문자열을 검사한다.
- RFC 7807 오류의 `status`, `code`, `message`를 보존하며 상세 404와 일반 실패를 UI에서 구분한다.
- 서버의 게시·검증 판정을 프론트에서 다시 추측하거나 필터링하지 않는다.

## 접근성·사용성

- 검색 입력과 select에 명시적 label, name, autocomplete를 연결했다.
- 카드 상세 열기, 닫기, 재시도, 초기화, 복사는 네이티브 button으로 구성했다.
- 상세를 인라인 패널로 배치해 모달 초점 트랩을 피하고 닫을 때 원래 카드 버튼으로 초점을 복귀한다.
- 목록·상세 로딩과 복사 결과는 `aria-live="polite"`로 알린다. Clipboard 거부를 성공으로 표시하지 않는다.
- `:focus-visible`, 모바일 44px 조작 영역, 축소 모션, 읽기 전용 복사 원문을 제공한다.
- 필터를 URL query에 기록해 새로고침과 공유 후에도 탐색 조건을 복원한다.

## 디자인 결정

기존 앱 셸의 따뜻한 종이색, 잉크색, 라임 검증 표식을 유지했다. 서명 요소는 9개 필수 항목을 번호가 있는 “프롬프트 청사진”으로 펼치는 상세 작업대다. 장식용 카드나 색상 경쟁 대신 검증 상태와 작업 순서에만 색과 번호를 사용했다.

## 실행 결과

Node 22.14.0을 명시해 아래 명령을 실행했다. 로컬 기본 Node 20.17.0은 저장소의 `engines.node >=22`보다 낮기 때문이다.

```text
npx -p node@22.14.0 npm test         # 4 files, 16 tests passed
npx -p node@22.14.0 npm run typecheck # passed
npx -p node@22.14.0 npm run build     # passed, JS 205.01 kB / gzip 64.93 kB
git diff --check                      # passed
```

## 잔여 위험

- 인앱 브라우저 대상이 현재 세션에 없어 실제 뷰포트 검증을 실행하지 못했다. 백엔드 fixture가 합쳐진 통합 브랜치에서 데스크톱·390px 모바일 E2E를 확인해야 한다.
- Clipboard API는 HTTPS 또는 localhost 보안 컨텍스트와 브라우저 권한에 영향을 받는다. 실패 안내와 직접 선택 가능한 원문으로 완화했다.
- 현재 API는 첫 페이지 20개만 사용한다. 데이터가 20개를 넘으면 계약을 유지한 페이지 이동 UI가 후속 작업으로 필요하다.
