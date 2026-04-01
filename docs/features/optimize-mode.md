# Optimize Mode Spec

## Purpose

Optimize Mode turns PromptBuilder into a prompt execution and optimization workspace.

It is designed for the loop:

Prompt -> Run -> Output -> Evaluate -> Improve -> Version -> Repeat

## User Goal

Users should be able to:
- run a prompt
- paste or capture the output
- evaluate the result
- auto-generate an improved prompt
- save and compare versions
- repeat the cycle

## Primary Inputs

- `prompt`
- `output`
- `goal`

## Primary Outputs

- `issues`
- `improvements`
- `improved_prompt`
- `next_action`

## Core Behaviors

### Run

Support a runner flow that captures execution results or pasted output.

### Evaluate

Inspect the output against the goal and identify failure modes.

### Optimize

Rewrite the prompt based on the detected issues and the target goal.

### Version

Save every meaningful prompt revision as a version.

### Repeat

Allow the next run to reuse the previous context and improvements.

## Analysis Dimensions

- goal match
- clarity
- output completeness
- format correctness
- constraint adherence
- result usefulness

## Free Strategy

The free version should support:
- prompt input
- output input
- evaluation
- prompt rewrite
- version save

Runner integration with external LLMs can remain optional.

## Current Implementation Notes

- The workspace now leans on result variants, history tabs, and compare-friendly review instead of a single vertical flow.
- Optimize entry is meant to stay one click away from the result screen.
- The current UI direction is lighter, card-based, and more compact so long scrolling is reduced.
