# AGENT.md

## Project

PromptBuilder is a prompt quality and workflow tool focused on:
- prompt generation
- prompt quality analysis
- model-specific prompt optimization
- prompt versioning and comparison
- result feedback loops
- reusable templates and libraries

## Source Of Truth

- `README.md`
- `docs/README.md`
- `docs/agent.md`
- `docs/plan.md`
- `docs/phase.md`
- `docs/features/README.md`
- `docs/tasks/README.md`

## Working Rules

1. Prefer small, incremental changes.
2. Preserve existing user work; do not revert unrelated edits.
3. Use `apply_patch` for manual file edits.
4. Keep documentation aligned with actual implementation status.
5. When changing product behavior, update the docs in the same pass.

## Product Direction

- Keep the free core usable without paid APIs.
- Make quality analysis the primary value, not just generation.
- Treat versioning and feedback as first-class features.
- Prefer local-first storage for lightweight usage.

## Current Priority

1. Prompt Quality Analyzer
2. Prompt Versioning
3. Result Feedback Loop
4. Multi-Model Optimizer
5. Template Library
6. Collaboration and sharing

## Notes For Future Agents

- Check `docs/plan.md` before starting feature work.
- Check `docs/phase.md` before changing priorities.
- If you add a feature, document its UX and storage impact.
- If a change needs server support, define the API contract first.
