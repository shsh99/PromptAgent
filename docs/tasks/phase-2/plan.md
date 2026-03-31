# Phase 2 Plan

## Goal

Ship an Optimize Mode that supports prompt execution, evaluation, and iterative improvement.

## Scope

- optimize mode UI
- output input field
- evaluation engine
- improve endpoint for output-based feedback
- result 3 variants
- one-click Optimize entry
- version save and compare
- loop history

## Execution Items

### 1. Mode Switch

- add `Optimize Mode`
- keep it separate from `Template Mode` and `Builder Mode`
- route the UI into the new workflow
- surface result variants before the optimize loop starts

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

### 8. Result Variants

- show three prompt variants after generation
- let the user apply, copy, or send a variant to Optimize
- keep the selected variant in local history

## Exit Criteria

- a user can complete one full optimization cycle
- the user can repeat the cycle with saved versions
- the free flow works without mandatory paid APIs
- the user can start from an example instead of a blank form
- the generated result can branch into three usable variants
