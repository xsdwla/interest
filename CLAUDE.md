# CLAUDE.md

Conventions for any Claude Code session in this repo. Read this and
`CONTEXT.md` before planning or writing code.

## What this repo is

A personal collection of items "of general interest" — no fixed
language, framework, or domain yet. Each top-level subdirectory may
turn out to be its own mini-project. When you arrive in one, look for
a local `CLAUDE.md` or `CONTEXT.md` there; it overrides this file.

## Workflow (Pocock-style)

Four phases, in order. Don't skip ahead.

1. **Alignment** — if the request is ambiguous, run `/grill-me` and
   interview the user one question at a time. Refuse to write code
   until the decision tree is resolved.
2. **Planning** — turn the alignment conversation into a PRD
   (`/to-prd`), then decompose into vertical-slice issues
   (`/to-issues`). A vertical slice is one end-to-end behavior, not
   a layer.
3. **Implementation** — pick one slice, run `/tdd` (red-green-refactor).
   Independent slices can be dispatched to parallel sub-agents.
4. **Review** — stop and hand back to the human at the end of each
   slice. After every few merged slices, run
   `/improve-codebase-architecture`.

## The smart zone

Working context degrades sharply past ~100K tokens. Keep tasks small
enough that the orchestrator's context stays well under that:

- Dispatch unfamiliar-code exploration to an `Explore` sub-agent
  instead of reading files yourself.
- Dispatch independent work to parallel general-purpose sub-agents
  in a single message.
- Sub-agents must return summaries, not raw tool dumps. The
  orchestrator should only re-read summaries.

## Domain language

Shared vocabulary lives in `CONTEXT.md`. Use the terms there
verbatim; don't invent synonyms. If a needed term is missing,
propose an addition and update `CONTEXT.md` in the same change.

## Architectural decisions

Non-trivial decisions go in `docs/adr/NNNN-<slug>.md` using the
template established by ADR-0001. Reference the ADR number in the
commit message and PR description.

## Git discipline

- Develop on the branch the user specified for the session.
- Always create new commits — never `--amend` published commits.
- Never `--no-verify`, never `git push --force` without explicit
  permission, never `git reset --hard` to make a problem disappear.
- A `.claude/hooks/git-guardrails.sh` `PreToolUse` hook enforces
  these (see `docs/pocock-workflow-plan.md` Phase 3).

## Tooling defaults (fill in once a stack lands)

When code is added to this repo, populate these so slash commands
have stable names to call:

- Test runner: _TBD — set in package.json or equivalent_
- Type checker: _TBD_
- Linter / formatter: _TBD_
- Pre-commit gate: _Husky once there's code worth gating_

Until then, treat any test/lint reference in a sub-prompt as
"check whether such a command exists and skip if it doesn't."

## When in doubt

Pause and ask. The cost of a clarification question is one round
trip; the cost of guessing is a wrong vertical slice that has to
be rolled back.
