# LLM Engineering Policy

## Purpose

This repository should use LLMs as a support layer, not as an invisible authority.

## Recommended Stack

- prompt structure
- intent routing
- template presets
- context engineering
- harness-style output contracts
- model fallback
- review checks

## Default Approach

1. Prefer deterministic logic first.
2. Use LLMs to expand, normalize, or rewrite.
3. Use rules to validate the result.
4. Fall back to a safe structure if the model fails.

## Intent Policy

Intent analysis should capture:
- explicit request
- likely purpose
- probable technique
- required fields
- confidence
- fallback label

## Prompt Policy

Prompt generation should capture:
- role
- background
- task
- output format
- tone
- constraints
- examples
- evaluation criteria

## Harness Policy

Harness-style prompts should be treated as a contract:
- input
- goal
- output schema
- failure handling
- rollback path
- quality check

## Model Selection Policy

- use the lightest model that can solve the task
- use a stronger model only when quality is clearly better
- keep a fallback route if the preferred model is unavailable

## Quality Checks

Every LLM result should be checked for:
- missing sections
- vague wording
- repeated phrases
- broken structure
- mismatch with the requested format

