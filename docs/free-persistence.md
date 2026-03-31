# 무료 영구 저장소 설정

PromptBuilder는 브라우저 `localStorage`와 Cloudflare D1을 함께 사용할 수 있습니다.

## 저장 대상

- 프롬프트 생성 로그
- 프롬프트 개선 / 최적화 로그
- 다운로드 / 복사 / 열람 행동 로그
- 프롬프트 히스토리 스레드와 버전
- 건의사항

## Cloudflare D1 설정

1. Cloudflare 대시보드에서 D1 데이터베이스를 생성합니다.
2. Pages 프로젝트에 D1 바인딩을 추가합니다.
3. 바인딩 이름은 `DB`로 설정합니다.
4. `wrangler.toml`에 D1 정보와 `migrations_dir = "migrations"`를 넣습니다.
5. 마이그레이션을 적용합니다.

```bash
npm run d1:migrate
```

또는 직접 실행할 수 있습니다.

```bash
wrangler d1 migrations apply DB --remote --config wrangler.toml
```

## 마이그레이션 파일

- `migrations/0001_event_logs.sql`
- `migrations/0002_prompt_history_and_suggestions.sql`

## 동작 방식

- `DB` 바인딩이 있으면 D1을 우선 사용합니다.
- D1 연결이 실패하면 메모리 fallback으로 동작합니다.
- 사용자 브라우저 기록은 계속 `localStorage`에 남습니다.
- 건의사항은 `suggestions` 테이블에 저장됩니다.
- 프롬프트 히스토리는 `prompt_threads`와 `prompt_versions`에 저장됩니다.

## 권장 운영 방식

- 서버 로그는 D1을 기준으로 유지합니다.
- 사용자 오프라인 기록은 `localStorage`를 보조 저장소로 사용합니다.
- 스키마가 바뀌면 마이그레이션을 다시 적용합니다.

