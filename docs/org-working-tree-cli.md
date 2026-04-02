# Working Tree and CLI Rules

## Purpose

Use working trees to keep parallel tasks isolated and easy to review.

## When To Use A Working Tree

- a new feature should stay separate from another active task
- a branch needs a clean workspace
- a risky edit should not touch the current tree
- a documentation package is being written alongside code work

## CLI Rules

- check branch name before editing
- check `git status` before and after the task
- keep commits focused
- do not mix unrelated cleanup with feature work
- keep the build/test command in the workflow

## Suggested Workflow

1. create or switch to the feature branch
2. open the working tree
3. make one logical change
4. run the build or the smallest relevant test
5. review the diff
6. open the PR

## Cleanup Rules

- remove stale working trees after merge
- close abandoned branches
- keep docs synchronized with the codebase

