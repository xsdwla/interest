#!/usr/bin/env bash
# PreToolUse hook for the Bash tool. Reads the tool payload on stdin
# and exits 2 to block dangerous git operations the agent might run
# unattended. The user can always run blocked commands themselves
# outside Claude Code.
#
# Requires jq. If jq is missing, the hook degrades to a no-op rather
# than blocking the agent entirely.

set -euo pipefail

payload="$(cat)"

if ! command -v jq >/dev/null 2>&1; then
  echo "git-guardrails: jq not installed; hook is degraded to no-op." >&2
  exit 0
fi

cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')"
if [ -z "$cmd" ]; then
  exit 0
fi

# Each entry is "<label>|<extended-regex>". Patterns are intentionally
# narrow; --force-with-lease and other safer variants are not matched.
patterns=(
  'force-push|git[[:space:]]+push[[:space:]]+([^[:space:]]+[[:space:]]+)*(-f([[:space:]]|$)|--force([[:space:]=]|$))'
  'reset-hard|git[[:space:]]+reset[[:space:]]+([^[:space:]]+[[:space:]]+)*--hard'
  'clean-force|git[[:space:]]+clean[[:space:]]+([^[:space:]]+[[:space:]]+)*-[a-zA-Z]*f'
  'checkout-discard|git[[:space:]]+checkout[[:space:]]+--[[:space:]]+\.'
  'restore-discard|git[[:space:]]+restore[[:space:]]+(--[a-z-]+[[:space:]]+)*\.'
  'branch-force-delete|git[[:space:]]+branch[[:space:]]+([^[:space:]]+[[:space:]]+)*-D'
  'no-verify|--no-verify([[:space:]]|$)'
  'no-gpg-sign|--no-gpg-sign([[:space:]]|$)'
)

for entry in "${patterns[@]}"; do
  label="${entry%%|*}"
  regex="${entry#*|}"
  if [[ "$cmd" =~ $regex ]]; then
    cat >&2 <<EOF
git-guardrails: blocked "$label"
  command: $cmd
  pattern: $regex

If this is genuinely needed:
  - run it yourself in a terminal outside Claude Code, OR
  - prepend GIT_GUARDRAILS_BYPASS=1 to the command (see below) and
    confirm to the user first.
EOF
    if [[ "${cmd}" == GIT_GUARDRAILS_BYPASS=1* ]]; then
      echo "git-guardrails: bypass token present; allowing." >&2
      exit 0
    fi
    exit 2
  fi
done

exit 0
