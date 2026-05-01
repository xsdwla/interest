# Reconfiguring Claude Code to Match Matt Pocock's "Workflow for AI Coding"

## Source caveat

The transcript page (whispertranscribe.ai) returned `403` from this
environment, so this plan is synthesized from secondary write-ups of the
talk and from Pocock's public `mattpocock/skills` repository
(its READMEs, the engineering skill index, and the talk's companion
"Claude Code for Real Engineers" cohort). The skill list below
matches the published repo; the workflow phases and the "smart zone"
framing come from reports on the same talk.

If you can paste the verbatim transcript (or save it to a file in the
repo), I can tighten the plan to direct quotes.

## What Pocock argues

1. **The smart zone is ~100K tokens.** Past that, reasoning quality
   collapses into the "dumb zone" — useful for retrieval, not for
   writing code. Every downstream decision (task size, slice shape,
   sub-agent boundaries) is dictated by keeping the working context
   under that ceiling.
2. **Four phases, in order:**
   - **Alignment** — the agent interviews *you* before it writes a
     line of code (`/grill-me`, `/grill-with-docs`).
   - **Planning** — turn the alignment conversation into a PRD, then
     decompose into *vertical slices* ("tracer bullets" — a working
     end-to-end thread, not a horizontal database-then-API-then-UI
     pass) (`/to-prd`, `/to-issues`).
   - **Implementation** — small, independently-executable issues, ideally
     run by parallel sub-agents, using TDD (`/tdd`).
   - **Review** — bring the human back in. Architecture review every
     few days (`/improve-codebase-architecture`).
3. **Shared domain language lives in `CONTEXT.md`** (plus ADRs).
   Verbosity goes down because the agent can say "materialization
   cascade" instead of restating the concept each time.
4. **Feedback rate is the speed limit** — invest in tests, hooks, and
   diagnostics so the loop is tight.
5. **Guardrails over trust** — `git-guardrails` hook blocks
   destructive git ops; pre-commit hooks gate lint/format/typecheck/tests.

## Mapping to Claude Code primitives

| Pocock concept | Claude Code primitive | Where it lives |
|---|---|---|
| `CONTEXT.md` | Project memory | `./CONTEXT.md` (referenced from `CLAUDE.md`) |
| Project conventions | `CLAUDE.md` | `./CLAUDE.md` |
| `/grill-me`, `/tdd`, `/diagnose`, etc. | Skills *or* slash commands | `.claude/skills/<name>/SKILL.md` or `.claude/commands/<name>.md` |
| Git guardrails | Hooks | `.claude/settings.json` (`PreToolUse` on `Bash`) |
| Parallel implementation | Sub-agents (`Agent` tool) | Invoked from a planning skill |
| Pre-commit gates | Husky | `.husky/pre-commit` |
| Architectural decisions | ADRs | `docs/adr/NNNN-<slug>.md` |

## The plan

### Phase 0 — Decide on installation strategy (you choose)

Two paths, pick one:

- **A. Install Pocock's skills wholesale.** Run
  `npx skills@latest add mattpocock/skills`, then `/setup-matt-pocock-skills`
  inside Claude Code. Fastest; you get all 16 skills as-written.
- **B. Hand-roll a minimal subset in this repo.** Author only the
  skills you'll actually use (alignment + planning + TDD + git
  guardrails) so they live under version control alongside the
  project. Slower; gives you full control and review-ability.

Recommendation: **B for this repo** (it's a personal "interest"
repo with no code yet — the overhead of 16 skills is wasted), then
switch to A if/when you start a larger project.

### Phase 1 — Author `CLAUDE.md` and `CONTEXT.md`

- `CLAUDE.md` — project conventions Claude reads on every session:
  preferred languages, test runner, lint/format commands, "always
  read `CONTEXT.md` before planning," "prefer vertical slices,"
  "stop and grill the user when requirements are vague." Keep it
  under ~200 lines so it doesn't eat the smart zone.
- `CONTEXT.md` — domain glossary + architectural shape. Start empty
  with section headers (Domain, Architecture, Invariants, Glossary).
  `/grill-with-docs` populates it over time.
- `docs/adr/0001-record-architecture-decisions.md` — bootstrap the ADR
  log so future decisions have a home.

### Phase 2 — Add the four highest-leverage slash commands

Author these as `.claude/commands/<name>.md` (or as skills under
`.claude/skills/`). Each one is a self-contained instruction file
the agent loads when invoked.

1. **`/grill-me`** — Interview the user one question at a time;
   refuse to answer the original request until ambiguity is resolved.
   Stop conditions: "user says 'enough'" or "all branches of the
   decision tree are resolved."
2. **`/to-prd`** — Compress the current conversation into a PRD
   (Problem, Users, Success metrics, Scope, Non-goals, Open questions).
   Output as a draft GitHub issue.
3. **`/to-issues`** — Decompose a PRD into vertical-slice issues.
   Each issue must be independently mergeable and contain one
   end-to-end behavior, not a layer.
4. **`/tdd`** — Force red-green-refactor. Refuses to write
   implementation code until a failing test exists.

Optional next tier: `/diagnose`, `/zoom-out`,
`/improve-codebase-architecture`.

### Phase 3 — Wire git guardrails as hooks

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/git-guardrails.sh"
          }
        ]
      }
    ]
  }
}
```

`git-guardrails.sh` reads the proposed bash command from stdin
(JSON), and exits non-zero with a message if it sees any of:
`git push --force`, `git reset --hard`, `git clean -f`,
`git checkout -- .`, `git branch -D`, `--no-verify`.

This is the Claude Code-native equivalent of Pocock's
`git-guardrails-claude-code` skill.

### Phase 4 — Lock the feedback loop

- `setup-pre-commit` equivalent: install Husky + lint-staged once
  there's actual code. For a docs-only repo, skip until needed.
- Add `npm test`, `npm run typecheck`, `npm run lint` to
  `package.json` so `CLAUDE.md` can reference standard names.

### Phase 5 — Sub-agent discipline

Document in `CLAUDE.md`:

- "When a task spans more than ~3 files of unfamiliar code, dispatch
  an `Explore` sub-agent first; do not read the files yourself."
- "When two issues are independent, dispatch them to parallel
  general-purpose sub-agents in a single message."
- "Each sub-agent must return under ~500 words; the orchestrator
  re-reads only the summary, never the raw tool output."

This is how you respect the 100K smart zone in practice.

### Phase 6 — Review cadence

Add a recurring habit (could be a `/loop` invocation or just a
calendar reminder):

- After every 2-3 merged PRs, run `/improve-codebase-architecture`.
- Before any large refactor, run `/grill-with-docs` to update
  `CONTEXT.md`.

## Concrete file deliverables for this repo

```
.
├── CLAUDE.md                          # session-level conventions
├── CONTEXT.md                         # domain + architecture
├── .claude/
│   ├── settings.json                  # hooks
│   ├── hooks/git-guardrails.sh        # block destructive git ops
│   └── commands/
│       ├── grill-me.md
│       ├── to-prd.md
│       ├── to-issues.md
│       └── tdd.md
└── docs/
    └── adr/
        └── 0001-record-architecture-decisions.md
```

## What I'd do next, if you green-light it

1. Write `CLAUDE.md` + `CONTEXT.md` skeletons.
2. Author the four slash commands listed in Phase 2.
3. Add `.claude/settings.json` + `git-guardrails.sh`.
4. Open ADR-0001.
5. Stop. Don't install Husky / pre-commit gates until there's
   actual code to gate.

Each of these is a small, reviewable change. Treat the rollout
itself as a vertical-slice exercise.
