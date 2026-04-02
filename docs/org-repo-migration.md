# Organization Repository Migration Guide

## Purpose

This document explains how to move PromptCraft from the current personal repository into a GitHub organization without losing the project story.

## Why Migrate

- keep the project reviewable by a team
- make PR / issue / branch discipline visible
- preserve the current code snapshot as a portfolio-ready baseline
- separate early experimental history from the organization operating model
- make future changes follow documented rules instead of chat memory

## Migration Strategy

Recommended strategy:
- keep the current repository as the reference source
- create a fresh organization repository
- import the current code state as the first organization snapshot
- start all new work through issue -> branch -> PR -> review -> merge

This keeps the code current while giving the organization repository a clean operating history.

## What To Carry Over

- current code snapshot
- docs/
- .github templates
- prompt and phase documentation
- workflow and policy docs
- history files that are part of the product

## What To Rebuild In The Organization Repo

- branch protection
- repository settings
- secrets and environments
- PR / MR review rules
- issue triage flow
- CODEOWNERS if used
- GitHub Actions permissions

## Recommended Steps

1. Freeze the current local snapshot.
2. Create the organization repository.
3. Push the current snapshot as the initial commit.
4. Add branch protection and repository settings.
5. Enable PR and issue templates.
6. Reconfirm the prompt and phase docs.
7. Start all new work on feature branches only.

## Success Criteria

- the organization repo contains the current product state
- the docs explain the product and workflow
- new changes can start with issue and branch discipline
- the initial organization history is clean and readable

## Notes

- If the team prefers a repo transfer, history can be preserved more directly, but the original main-only pattern will remain visible.
- If the team prefers a fresh organization history, use a new repo and import only the current snapshot.
- For this project, the snapshot-first approach is the cleaner portfolio story.

