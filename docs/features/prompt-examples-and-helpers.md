# Prompt Examples and Helpers

## Purpose

Help users start faster and write better prompts with less blank-page friction.

## Problems This Solves

- users do not know how to begin
- prompts are too request-driven and not problem-driven
- output format and constraints are often missing
- users need a working example before writing their own

## Feature Set

### Starter Templates

Provide ready-to-use prompt seeds for common flows:

- marketing brief
- code review
- bug fix
- meeting summary
- content rewrite
- product planning

### Prompt Examples

Each example should include:

- prompt
- sample output
- goal
- why it works

### Prompt Helpers

Add lightweight helpers that remind the user to include:

- problem framing
- input data
- reasoning
- constraints
- output schema
- evaluation criteria
- examples
- recovery instructions

## UX Rules

- show examples inside the Optimize workspace
- let users load examples into the current form with one click
- let users copy examples to clipboard
- keep helper text short and actionable
- avoid forcing advanced users to read extra steps

## Data Shape

```json
{
  "title": "Problem Framing",
  "prompt": "...",
  "output": "...",
  "goal": "...",
  "tags": ["starter", "optimize", "problem-framing"]
}
```

## Implementation Notes

- keep example data local-first
- store user sessions separately from example templates
- reuse the same examples in Builder and Optimize when possible
- surface the checklist near the input area, not hidden in docs

## Current Implementation Notes

- The template cards in the home surface now act as the fastest entry point for common tasks.
- Example content should stay short enough to load into the current form without extra cleanup.
- Helper text should remain concise so advanced users can scan it quickly, but the checklist should still cover framing, data, constraints, schema, and recovery.
