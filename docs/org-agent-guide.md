# Organization Agent Guide

## Purpose

This document defines how AI agents should work in this repository when the project moves to a GitHub organization.

The goal is simple:
- keep changes traceable
- keep humans in control
- keep AI output reviewable
- keep the product shippable

## Operating Principles

1. Do not change existing behavior unless the current issue explicitly requires it.
2. Prefer small, reviewable changes over large cross-cutting edits.
3. Every AI-generated change must be explainable in a PR.
4. Every AI-generated decision must preserve a human override path.
5. If the answer is uncertain, capture the uncertainty in the issue or PR rather than hiding it.

## What AI Can Own

- drafting code
- proposing refactors
- filling templates
- writing docs
- generating prompt variants
- summarizing logs and review feedback
- suggesting follow-up issues

## What Humans Must Own

- final approval
- merge decisions
- production rollout
- scope changes
- product tradeoffs
- security-sensitive decisions

## Prompting Rules For Agents

1. State the goal in one sentence.
2. State the expected output format.
3. State the constraints.
4. State what must not change.
5. State the files in scope.
6. State the review criteria.

## Failure Rules

If AI output is weak:
- ask for a revision
- narrow the scope
- add examples
- reduce ambiguity
- split the task into smaller steps

If AI output is risky:
- stop the change
- document the risk
- move the work to a human-reviewed issue

## Review Requirement

No AI-generated change is considered complete until:
- it has a PR
- the PR description explains the intent
- the checklist is filled out
- the diff has been reviewed by a human

