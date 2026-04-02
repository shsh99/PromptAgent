# Project Overview

## Purpose

This document gives a single-page map of PromptBuilder.

It answers four questions:
- what the product is
- what technologies it uses
- how the codebase is divided
- where the important behavior lives

## Product Summary

PromptBuilder is a structure-first prompt platform.

It helps users:
- detect intent
- choose a prompt strategy
- fill in the missing structure
- generate a prompt
- evaluate the result
- improve it iteratively
- compare versions
- reuse templates
- review activity and admin feedback

## Technology Stack

### Runtime

- Cloudflare Pages
- Cloudflare Workers / Functions
- Hono

### Frontend

- TypeScript
- React
- static client-side features
- CSS-based theme handling

### Prompt And AI Layer

- rule-based intent routing
- harness-style prompt construction
- model hints and fallback routing
- multi-AI routing docs for Cloudflare Workers AI and Gemini

### Supporting Tooling

- GitHub issue templates
- PR template
- working-tree workflow docs
- phase and task planning docs

## Main Modules

### 1. App Shell

Location:
- `webapp/src/app/*`

Responsibilities:
- bootstrapping
- route handling
- renderer setup
- API surface

### 2. Prompt Domain

Location:
- `webapp/src/features/prompt/*`

Responsibilities:
- intent and prompt analysis
- prompt field generation
- quality scoring
- helper config
- prompt strategy rules

### 3. Home And Workflow UI

Location:
- `webapp/src/features/home/*`
- `webapp/public/static/features/prompt/*`
- `webapp/public/static/features/optimize/*`

Responsibilities:
- template market entry
- smart input flow
- mode switching
- optimize loop
- history and version actions

### 4. History And Admin

Location:
- `webapp/public/static/features/history/*`

Responsibilities:
- prompt history
- version compare
- admin reporting
- suggestion visibility
- usage analytics

### 5. Shared UI And Styling

Location:
- `webapp/public/static/style.css`
- `webapp/public/static/features/common/*`

Responsibilities:
- theme tokens
- component consistency
- cross-mode styling
- reusable UI helpers

### 6. Documentation Layer

Location:
- `docs/*`

Responsibilities:
- phase plans
- prompt contracts
- organization workflow
- portfolio notes
- prompt library rules

## Repository Structure

```text
PromptAgent/
├─ webapp/                  # Main application
│  ├─ src/
│  │  ├─ app/               # bootstrap, routes, renderer
│  │  ├─ features/          # prompt domain and home feature code
│  │  └─ shared/            # common helpers if needed
│  └─ public/static/        # client-side feature bundles and CSS
├─ docs/                    # product, phase, prompt, and org docs
├─ .github/                 # PR and issue templates
└─ deploy/config files      # Cloudflare and build settings
```

## Behavior Boundaries

### Keep In Code

- prompt field composition
- quality analysis
- history persistence
- template application
- version save and restore
- optimize loop behavior

### Keep In Docs

- phase order
- prompt asset policy
- multi-AI routing policy
- organization rules
- portfolio narrative

### Keep In UI

- mode switching
- smart input entry
- template market
- result comparison
- admin visibility

## AI Usage Model

The project uses AI as a support layer, not as an invisible authority.

Typical AI responsibilities:
- intent classification
- prompt rewrite
- prompt optimization
- model-specific rewriting
- suggestion generation

Typical non-AI responsibilities:
- validation
- fallback routing
- persistence
- version tracking
- review workflow

## Recommended Reading Order

1. `docs/README.md`
2. `docs/plan.md`
3. `docs/phase.md`
4. `docs/prompt-library.md`
5. `docs/phase-workflow.md`
6. `docs/features/README.md`
7. `docs/org-agent-guide.md`

## Update Rule

If the module layout, tech stack, or AI routing changes, update this document in the same change.

