# Multi-AI Routing Spec

## Why This Exists

PromptBuilder should be able to use more than one AI backend without changing the user workflow.

The goal is not to pick a single "best" model forever.
The goal is to keep the app useful for longer by routing requests to the backend that still has capacity, then falling back safely when one service hits its limit.

## Product Definition

Multi-AI routing = a server-side decision layer that chooses between:
- Cloudflare Workers AI
- Gemini API
- rule-based fallback

The routing layer should be invisible to the user.
The UI should keep a single flow:
- analyze intent
- fill fields
- generate prompt
- optimize result
- save version

## Core Principle

Use the cheapest and most reliable path first.
Escalate to a stronger model only when the current path is not enough.

## Supported Backends

### Cloudflare Workers AI

Best for:
- low-latency routing inside the existing Cloudflare stack
- short intent analysis
- lightweight prompt expansion
- free-tier usage aligned with the current deployment stack

Strengths:
- no extra infra hop
- fits Pages / Workers deployment
- simple secret handling

### Gemini API

Best for:
- higher-quality Korean text generation
- richer prompt rewriting
- fallback when Cloudflare output is too thin

Strengths:
- strong free tier for small projects
- good Korean generation quality
- useful as a quality layer

### Rule-Based Fallback

Best for:
- outage handling
- quota exhaustion
- deterministic minimum behavior

This fallback must always be available.

## Routing Policy

### Default Priority

1. Cloudflare Workers AI
2. Gemini API
3. Rule-based fallback

### Intent Analysis

Recommended route:
- use Workers AI first if latency and integration matter most
- use Gemini first if Korean quality is the main concern

### Prompt Generation

Recommended route:
- use the backend with the better remaining quota
- if both are available, prefer the one that matches the requested style
- if the requested result is short and structured, Workers AI is acceptable
- if the requested result needs richer Korean wording, Gemini is preferred

### Optimization

Recommended route:
- use the backend that still has quota left
- prefer deterministic improvements if the prompt is already close to target quality
- prefer the stronger model if the prompt needs deeper rewriting

## Quota Strategy

The app should track usage separately for each backend.

Do not treat the free tiers as one combined pool.

Track at least:
- daily request count
- last successful backend
- fallback count
- rate-limit failures

If the current backend fails because of quota or rate limiting:
- mark it as temporarily unavailable
- try the next backend
- if both fail, return a structured rule-based response

## User Flow

1. User enters a short request or selects a template.
2. Intent analysis runs on the primary backend.
3. The system fills role, context, task, output format, tone, and constraints.
4. Prompt generation uses the chosen backend.
5. Optimization reuses the same routing logic.
6. If a backend is exhausted, the next backend takes over.

## Quality Expectations

The routing layer should preserve:
- the same prompt structure
- the same template vocabulary
- the same evaluation checks
- the same versioning history

The backend choice should not break:
- template market
- quick start
- manual builder
- version compare
- admin logs
- suggestion board

## Failure Rules

If AI is unavailable:
- return a structured rule-based draft
- keep the output format intact
- do not return a blank response

If one backend is slow:
- prefer a timeout and fallback over waiting indefinitely

If both backends fail:
- explain the failure clearly
- preserve the user’s input
- allow retry without losing state

## Implementation Notes

### Recommended Server API

- `POST /api/intent`
- `POST /api/generate`
- `POST /api/optimize`

The API should accept a `backend` field or choose automatically.

### Suggested Environment Variables

- `CLOUDFLARE_AI_ENABLED`
- `GEMINI_API_KEY`
- `DEFAULT_AI_BACKEND`
- `AI_FALLBACK_ENABLED`

### Suggested Telemetry

Store:
- chosen backend
- fallback reason
- quota error reason
- latency
- output length

## What This Does Not Guarantee

Multi-AI routing does not guarantee perfect outputs.

It does guarantee:
- more uptime
- safer fallback behavior
- better cost control
- more flexible model choice

## File Mapping

- `webapp/src/app/routes.ts`
  - backend selection
  - intent route
  - generate route
  - optimize route
- `webapp/public/static/features/prompt/technique.js`
  - intent analysis UI
  - apply flow
- `webapp/public/static/features/optimize/optimize-extras.js`
  - template market integration
  - quick start integration
- `docs/features/prompt-harness.md`
  - prompt contract rules
- `docs/features/optimize-workflow.md`
  - result improvement loop

## Practical Recommendation

For this project, the safest sequence is:

1. Cloudflare Workers AI for the first pass
2. Gemini API for quality fallback
3. Rule-based fallback for hard failures

This keeps the app usable even when one provider reaches its free-tier limit.
