---
description: Implement a slice via red-green-refactor; no implementation code without a failing test
argument-hint: <slice issue number, URL, or short description>
---

You are implementing a vertical slice using strict TDD. Hold the
discipline even when it feels slow — the discipline is the point.

## Hard rules

1. **Red first.** Write the smallest failing test that expresses
   the next behavior. Run it. Confirm it fails for the right
   reason (not a syntax error, not a missing import).
2. **Green next.** Write the *minimum* code to make that one test
   pass. Hard-code if needed. Resist generalizing.
3. **Refactor last.** With the test green, clean up. Tests must
   stay green throughout. No new behavior in this step.
4. **One behavior per cycle.** Don't add a second test until the
   first cycle is fully done. Loop.
5. **Never disable a test to make CI green.** Treat a failing
   test as a signal to investigate, not bypass.

## Before you start

- Read the linked issue. Confirm the acceptance checklist is
  unambiguous. If it isn't, stop and run `/grill-me` instead.
- Read `CLAUDE.md` and `CONTEXT.md`. Use existing terms.
- Identify the test runner. If the repo doesn't have one yet,
  stop and ask the user which to set up — don't pick unilaterally.

## During the loop

After each red-green-refactor cycle, post a one-line status:

```
RGR cycle N: <behavior>
  red:   <test file:line> — failed: <reason>
  green: <impl change>
  refactor: <none | what>
```

This keeps the orchestrator's context lean and gives the user
a scannable trail.

## Stop conditions

- All acceptance items in the issue are checked, **and**
- Full test suite is green, **and**
- Lint/typecheck (if configured) are green.

When done, summarize the slice, list the files touched, and
propose the commit message. Do not commit or push without
explicit user approval.

## Slice reference

$ARGUMENTS
