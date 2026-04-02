# Prompt Harness Spec

## Why This Exists

PromptBuilder should not behave like a plain prompt generator.
Its main value is to turn an idea into a structured prompt contract that is:
- clear
- testable
- reusable
- editable by version
- optimizable per model

## Product Definition

Prompt Harness = a prompt package with:
- role
- problem framing
- input data
- context
- task
- goal
- non-goal
- reasoning guidance
- constraints
- output contract
- evaluation criteria
- examples
- feedback loop

## Core Principle

Do not optimize only the text.
Optimize the operating contract around the text.

## Harness Schema

### Required Fields

- `role`
- `problem_framing`
- `input_data`
- `task`
- `goal`
- `reasoning`
- `output_format`
- `evaluation_criteria`

### Recommended Fields

- `context`
- `non_goal`
- `must_have`
- `should_have`
- `constraints`
- `input_guardrails`
- `output_guardrails`
- `feedback_loop`
- `rollback_plan`
- `examples`

### Optional Fields

- `example`
- `monitoring_rules`
- `tone`
- `model_target`

## User Flow

1. Choose a use case.
2. Choose a role.
3. Fill the harness fields.
4. Run quality analysis.
5. Optimize for a target model if needed.
6. Save as a version.
7. Test the output.
8. Feed the result back into the harness.
9. Generate the next version.

## Quality Analyzer Output

The analyzer should explain:
- what is missing
- what is ambiguous
- what wastes tokens
- what will likely fail at runtime
- what should be added for the selected model
- whether the prompt is solving a problem or only requesting output

## Model Optimization Rules

### GPT

- use strong structure
- prefer bullets and steps
- keep constraints explicit

### Claude

- preserve context depth
- keep background and rationale
- avoid overly compressed instructions

### Gemini

- write direct instructions
- keep the task unambiguous
- make output contract obvious

## Versioning Rules

- Save every meaningful change as a version.
- Show diff against the previous version.
- Store the reason for the change.
- Allow restore from any version.

## Feedback Rules

Feedback should capture:
- output quality
- format failures
- missing detail
- overlong output
- incorrect task interpretation

Feedback should then produce:
- a ranked failure reason
- a next-step improvement suggestion
- an updated harness draft

## Free-Use Strategy

The free version should include:
- quality analysis
- versioning
- local history
- model-style transforms
- template library

Paid dependencies should remain optional.

## File Mapping

- `webapp/src/features/prompt/helpers.ts`
  - public helper entry point
  - compatibility re-exports
- `webapp/src/features/prompt/helpers-config.ts`
  - purpose config
  - cache-backed lookup helpers
- `webapp/src/features/prompt/helpers-fields.ts`
  - auto field generation
  - field composition for techniques
- `webapp/src/features/prompt/quality.ts`
  - quality analysis
  - model hints
  - localized summary blocks
- `webapp/src/features/prompt/prompt-services.ts`
  - prompt generation
  - strategic guidance blocks
  - final verification blocks
- `webapp/src/app/routes.ts`
  - API contracts
  - log storage
  - improve endpoint
- `webapp/public/static/features/prompt/*.js`
  - modals
  - prompt history
  - version UI
  - feedback UI

## Current Implementation Notes

- The prompt layer is now split into `System / Template / User Input` instead of one long mixed contract.
- The analyzer adds problem framing, input data, reasoning guidance, examples, and recovery checks.
- The current free path can still run end to end without mandatory paid APIs.

## What These Techniques Do Not Guarantee

No single technique guarantees a perfect prompt by itself.

- Zero-shot helps only when the task is already clear.
- Few-shot depends on the quality of the examples.
- Chain of thought helps with reasoning, but it still needs a well-defined task and output contract.
- Prompt chaining improves reliability for complex tasks, but weak step boundaries still produce weak results.
- Role prompting stabilizes tone and perspective, but it cannot replace structure, constraints, or verification.
- Context engineering improves the available context, but irrelevant or contradictory context still hurts quality.
- Harness engineering is the most complete approach here, but it still needs explicit evaluation criteria, failure handling, and iteration.

The project should therefore present these techniques as reliability tools, not as magic guarantees.
