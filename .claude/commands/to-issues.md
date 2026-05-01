---
description: Decompose a PRD into vertical-slice GitHub issues
argument-hint: <PRD issue number or URL>
---

Take the referenced PRD and break it into vertical-slice issues.
Each issue must be independently mergeable and deliver one
end-to-end behavior.

## Rules

1. **Vertical, not horizontal.** A slice goes from user input
   through to user-visible result. It is *not* "set up the
   database" or "add the API layer." If you can't describe the
   slice as a sentence starting "the user can now ...", it isn't
   a slice.
2. **Independently mergeable.** Each slice should ship on its own
   without breaking main. If slice B requires slice A, say so
   explicitly with `Depends on: #N` and order them.
3. **Small.** Aim for one slice = one focused PR. If a slice feels
   bigger than a day's work, split it.
4. **Tracer bullet first.** The first slice should be the thinnest
   end-to-end thread that proves the architecture works, even if
   it's hard-coded or fake-data behind the scenes.
5. **Test plan per slice.** Every issue includes a short test plan
   — the slice isn't done until those checks pass.

## Issue template

```markdown
## Slice
The user can now <one sentence>.

## Why this is a slice, not a layer
<one sentence>

## Depends on
#N (or "none")

## Acceptance
- [ ] Behavior 1
- [ ] Behavior 2

## Test plan
- [ ] Manual / automated check 1
- [ ] Manual / automated check 2

## Notes
Anything the implementer needs that isn't obvious from the PRD.
```

## Workflow

1. Read the PRD via `mcp__github__issue_read`.
2. Propose a list of slices (titles + one-line summaries) and stop
   for user approval. Don't create issues yet.
3. After approval, create issues with `mcp__github__issue_write`.
   Apply label `slice`. Cross-reference each issue's `Depends on:`.
4. Update the PRD issue body with a checklist of slice issue links.
5. Return the list of created issue URLs in dependency order.

## PRD reference

$ARGUMENTS
