# PromptBuilder

PromptBuilder is a local-first prompt engineering workspace for building, improving, and optimizing prompts.

## What It Does

- generates structured prompts from selected techniques
- analyzes prompt quality and weak spots
- improves prompts with feedback
- supports Optimize Mode for prompt -> output -> evaluate -> improve loops
- stores history and versions locally
- provides starter templates and helper examples for faster prompt creation

## Main Modes

- Template Mode: quick starter prompts for common use cases
- Builder Mode: harness-style prompt construction
- Optimize Mode: result-driven prompt improvement and version comparison

## Key Features

- prompt harness fields
- problem framing and output schema support
- quality scoring and improvement hints
- version history with compare and rollback
- example prompts and starter templates
- checklist-style prompt helpers

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name promptbuilder --branch main --commit-dirty=true
```

## Project Layout

```text
.
|-- webapp/
|   |-- src/
|   |   |-- index.tsx
|   |   |-- renderer.tsx
|   |   `-- routes.ts
|   `-- public/
|       `-- static/
|           |-- app.js
|           |-- history.js
|           |-- improve.js
|           |-- library.js
|           |-- optimize.js
|           |-- prompt.js
|           `-- style.css
|-- docs/
|-- vite.config.ts
|-- wrangler.jsonc
|-- package.json
`-- ecosystem.config.cjs
```

## API Overview

- `GET /`
- `GET /api/techniques`
- `GET /api/techniques/:id`
- `GET /api/purposes`
- `POST /api/recommend`
- `POST /api/auto-fill`
- `POST /api/generate`
- `POST /api/generate-chain`
- `POST /api/generate-context-doc`
- `POST /api/improve`
- `POST /api/optimize`
- `POST /api/logs`
- `GET /api/admin/logs`
- `DELETE /api/admin/logs`

## Notes

- The app is designed to stay usable without paid APIs.
- Examples and helper templates are stored locally and can be expanded over time.
- Version comparison and rollback are implemented in Optimize Mode.

