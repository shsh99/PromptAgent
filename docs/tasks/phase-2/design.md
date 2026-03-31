# Phase 2 Design

## Objective

Add Optimize Mode so the user can run, evaluate, and improve prompts in a loop.

## UX Shape

- left panel: prompt input
- center panel: output input or runner result
- right panel: issues and improvements
- bottom area: versions and loop history

## Data Shape

Recommended session data:

```ts
{
  id: string
  mode: 'template' | 'builder' | 'optimize'
  goal: string
  prompt: string
  output: string
  issues: string[]
  improvements: string[]
  versions: Array<{
    version: number
    prompt: string
    createdAt: string
  }>
}
```

## Optimization Output

The optimizer should produce:
- issue list
- fix list
- revised prompt
- short next action

## Success Criteria

- the loop is obvious to the user
- optimization depends on output, not just the prompt
- version history is visible

