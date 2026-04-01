# Optimize UI Reference

## Reference Style

Use the following product traits from the reference project:
- simple mode tabs
- light, clean, card-based layout
- minimal top hero text
- compact stats surface
- clear optimize workspace
- visible compare and revision area

## Recommended Layout

### Header

- brand
- mode tabs
- stats shortcut

### Hero

- one strong sentence
- short supporting line
- avoid long marketing copy

### Workspace

- left: prompt or template input
- center: output or result input
- right: analysis and optimization
- on narrow screens, collapse into stacked tabs or cards instead of fixed columns

### Optimize Panel

- score summary
- issue list
- improvement list
- before/after prompt diff

## Visual Direction

- use bright neutral surfaces
- keep cards distinct with soft borders
- use gradients only as accents
- avoid cluttered dense text blocks

## UX Direction

- one primary action per mode
- reduce nested controls
- keep iteration visible
- make compare/rollback easy to access

## Current Implementation Notes

- The admin, history, and optimize surfaces now prefer tab switching over long scrolling.
- Dark and light mode tokens should keep button labels readable without relying on a bright default surface.
- Compact card spacing is preferred when the amount of text is small relative to the available panel height.
