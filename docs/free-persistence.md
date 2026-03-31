# Free Persistence Setup

PromptBuilder uses browser `localStorage` for user-side history and Cloudflare D1 for server-side persistence when the `DB` binding is available.

## Stored Data

- Prompt generation logs
- Prompt improvement / optimization logs
- Download / copy / view activity logs
- Prompt history threads and versions
- Suggestions

## Cloudflare D1 Setup

1. Create a D1 database in the Cloudflare dashboard.
2. Add a D1 binding to the Pages project.
3. Use `DB` as the binding name.
4. Set the binding in `wrangler.toml` and point `migrations_dir` to `migrations`.
5. Apply migrations with `npm run d1:migrate` or:

```bash
wrangler d1 migrations apply DB --remote --config wrangler.toml
```

## Migration Files

- `migrations/0001_event_logs.sql`
- `migrations/0002_prompt_history_and_suggestions.sql`

## Behavior

- When `DB` exists, D1 is used first.
- If D1 fails, the app falls back to in-memory logging.
- Browser history still stays in `localStorage`.
- Suggestions are stored in the `suggestions` table.
- Prompt history is stored in `prompt_threads` and `prompt_versions`.

## Recommendation

For production on the free tier:

- Keep `DB` as the primary source of server logs.
- Keep `localStorage` as the user-side offline backup.
- Re-run migrations whenever schema changes.

