# Phase 1 Design

## Objective

Build a prompt quality analyzer that explains why a prompt is weak and how to fix it.

## User Value

- users can see what is missing before running the prompt
- users can compare prompt quality across versions
- users can improve prompts without external paid APIs

## Analyzer Output

The analyzer should produce:
- score
- grade
- failed checks
- improvement tips
- model-specific rewrite hints

## Checks

### Structural Checks

- role present
- task present
- output format present
- constraints present
- context present when needed

### Risk Checks

- ambiguous wording
- missing constraints
- missing failure boundaries
- too much generic phrasing
- weak output contract

### Efficiency Checks

- repeated phrasing
- redundant instructions
- overly long context
- missing prioritization

## Data Shape

Recommended analyzer shape:

```ts
{
  score: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  checks: Array<{
    key: string
    label: string
    passed: boolean
    tip: string
  }>
  summary: string
  suggestions: string[]
  modelHints: Record<string, string[]>
}
```

## Implementation Notes

- Keep the analyzer deterministic.
- Start with rules and heuristics, not LLM calls.
- Reuse the existing `analyzePromptQuality` flow.
- Expose the result in the current result panel.

