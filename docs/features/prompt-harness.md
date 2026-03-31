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

- `webapp/src/helpers.ts`
  - quality analysis
  - harness generation
  - model transforms
- `webapp/src/routes.ts`
  - API contracts
  - log storage
  - improve endpoint
- `webapp/public/static/*.js`
  - modals
  - prompt history
  - version UI
  - feedback UI
