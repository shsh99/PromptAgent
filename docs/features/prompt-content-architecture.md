# Prompt Content Architecture Spec

## Problem

Current prompts are mostly request driven:
- role
- task
- tone
- length

That is not enough for complex work.

## Target Structure

### Required Blocks

- `ROLE`
- `CONTEXT / PROBLEM`
- `INPUT DATA`
- `TASK`
- `CONSTRAINTS`
- `REASONING`
- `OUTPUT FORMAT`
- `EVALUATION CRITERIA`
- `EXAMPLES`

### Optional Blocks

- `CONTEXT MEMORY`
- `FAILURE RECOVERY`
- `FOLLOW-UP ACTIONS`

## What Each Block Does

### ROLE

Defines who the model should act as and how much domain depth is expected.

### CONTEXT / PROBLEM

Explains the problem situation, target KPI, audience, or business context.

### INPUT DATA

Provides the actual data or facts the model should use instead of guessing.

### TASK

States the primary action the model must perform.

### CONSTRAINTS

Limits style, length, format, exclusions, and output boundaries.

### REASONING

Forces step-by-step thinking before the final answer.

### OUTPUT FORMAT

Defines the structure of the final response so it can be reused or automated.

### EVALUATION CRITERIA

Explains how to judge whether the output is good.

### EXAMPLES

Shows input-to-output behavior and reduces ambiguity.

## Recovery Layer

If the result is weak, the system should support:
- analyze failure
- identify missing structure
- regenerate with stronger constraints

## Why This Improves Usability

- reduces vague prompts
- improves repeatability
- makes output easier to automate
- makes prompt quality measurable
- makes model-specific rewriting possible

## Free Strategy

This architecture should be available in the free core.
No paid API should be required to use the content structure.

