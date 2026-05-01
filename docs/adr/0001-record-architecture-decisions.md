# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-05-01

## Context

Architectural decisions in this repo would otherwise live only in
chat transcripts and PR descriptions, both of which decay. Claude
Code sessions also need a stable, indexable place to read prior
decisions during planning.

## Decision

We use Architecture Decision Records (ADRs), one Markdown file per
decision, stored in `docs/adr/NNNN-<slug>.md`. The format is
intentionally minimal:

```
# ADR-NNNN: <title>

- Status: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- Date: YYYY-MM-DD

## Context
What forces are in play?

## Decision
What we are doing.

## Consequences
What becomes easier, what becomes harder.
```

Numbering is monotonic; never reuse a number. Superseding an ADR
keeps the old file in place with its status updated.

## Consequences

- Future Claude Code sessions can grep `docs/adr/` for relevant
  prior decisions without re-asking the human.
- Adds one file per non-trivial decision; the overhead is intentional.
- Decisions made in PRs without an ADR are considered tentative and
  should be ratified later if they hold up.
