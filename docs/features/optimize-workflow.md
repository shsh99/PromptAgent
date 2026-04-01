# Optimize Workflow Spec

## Loop Structure

1. Create a prompt
2. Run it
3. Collect output
4. Evaluate output
5. Find issues
6. Generate improved prompt
7. Save version
8. Repeat

## Current Flow Notes

- The current product also exposes three generated result variants before the optimization loop starts.
- History and compare are part of the same repeat cycle, not a separate dead-end screen.
- The optimize loop should preserve the selected variant so the next step can reuse the same context.

## What The Workflow Must Capture

- original prompt
- output text
- target goal
- detected issues
- fix suggestions
- revised prompt
- version history

## Why This Matters

Without output feedback, optimization becomes guesswork.

This workflow makes improvement measurable and repeatable.
