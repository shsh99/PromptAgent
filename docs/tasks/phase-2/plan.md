# Phase 2 Plan

## Goal

Ship an Optimize Mode that supports prompt execution, evaluation, and iterative improvement.

## Scope

- optimize mode UI
- output input field
- evaluation engine
- improve endpoint for output-based feedback
- version save and compare
- loop history

## Execution Items

### 1. Mode Switch

- add `Optimize Mode`
- keep it separate from `Template Mode` and `Builder Mode`
- route the UI into the new workflow

### 2. Prompt Runner

- add prompt run entry point
- support pasted output if external execution is used
- capture run metadata

### 3. Output Evaluator

- compare output against goal
- detect missing detail, format failure, and mismatch
- generate issue tags

### 4. Optimizer

- generate improved prompt from prompt + output + goal
- reuse the existing analyzer logic
- output concise next actions

### 5. Versioning

- save prompt revisions
- compare old and new versions
- support rollback

### 6. Loop History

- record prompt, output, issue, improvement, timestamp
- show iteration history in the UI

### 7. Examples And Helpers

- provide starter templates for common prompt tasks
- add a prompt-writing checklist
- allow one-click loading of sample prompts
- make the first run easier for new users

## Exit Criteria

- a user can complete one full optimization cycle
- the user can repeat the cycle with saved versions
- the free flow works without mandatory paid APIs
- the user can start from an example instead of a blank form
