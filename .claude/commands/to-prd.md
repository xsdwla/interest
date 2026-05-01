---
description: Compress the current conversation into a PRD and post it as a draft GitHub issue
argument-hint: [optional title hint]
---

Take everything established in this conversation (most likely from a
prior `/grill-me` session) and produce a Product Requirements
Document. Then post it as a GitHub issue using the `mcp__github__`
tools.

## Rules

1. **Source from the conversation, not your imagination.** If a
   field has no answer in the transcript, write `_TBD — see open
   questions_` rather than guessing.
2. **Use `CONTEXT.md` glossary terms verbatim.**
3. **Keep it tight.** Aim for 1 page rendered. Bullet points over
   prose. The PRD is read by humans *and* by future sub-agents
   working under the smart-zone budget.
4. **Don't decompose into tasks here.** That's `/to-issues`.

## PRD template

```markdown
# <feature title>

## Problem
One paragraph. Who hurts, how often, what it costs.

## Users
Bulleted: who triggers, who consumes.

## Success metrics
Concrete signal that tells us it worked.

## Scope
The smallest thing that delivers value.

## Non-goals
Things we are deliberately not doing in this PRD.

## Constraints
Perf, compat, deadlines, deployment.

## Open questions
- [ ] Question 1
- [ ] Question 2

## Prior art
Links to ADRs, files, or external references.
```

## Output

1. Show the PRD inline for the user to review.
2. Ask: "Post as draft issue, or revise?"
3. On approval, call `mcp__github__issue_write` to create the issue
   with label `prd` (create the label if it doesn't exist via
   `mcp__github__create_label`). Title format: `[PRD] <title>`.
4. Return the issue URL and propose `/to-issues #<number>` as the
   next step.

## Seed

$ARGUMENTS
