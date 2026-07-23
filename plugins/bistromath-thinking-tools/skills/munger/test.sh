#!/usr/bin/env bash
# Munger hook self-check. Run: bash ~/.claude/skills/munger/test.sh
# Asserts the Stop hook fires only when the CURRENT TURN ran a git-write action
# (commit/push/gh pr create) inside a git repo, and stays silent (fail-open) on
# every other branch — including prose that merely says "done". No frameworks.
set -u
HOOK=~/.claude/skills/munger/hook.js
GITREPO=$(mktemp -d)                 # hermetic throwaway repo, not the caller's cwd
git -C "$GITREPO" init -q
trap 'rm -rf "$GITREPO"' EXIT
export TX=/tmp/munger-test-tx.jsonl
pass=0; fail=0

# Build a transcript from per-arg segments. Each arg is "K:value" where K is:
#   P=user prompt (turn boundary)  A=assistant text  T=assistant Bash tool_use
#   R=user tool_result (mid-turn, NOT a boundary). node does the JSON escaping
#   so command strings with quotes pass through cleanly.
fixture() {
  node -e '
    const fs=require("fs"); const tx=process.env.TX;
    const lines=process.argv.slice(1).map(s=>{
      const k=s[0], v=s.slice(2);
      if(k==="P")return JSON.stringify({type:"user",message:{role:"user",content:v}});
      if(k==="A")return JSON.stringify({type:"assistant",message:{role:"assistant",content:[{type:"text",text:v}]}});
      if(k==="T")return JSON.stringify({type:"assistant",message:{role:"assistant",content:[{type:"tool_use",name:"Bash",input:{command:v,description:"x"}}]}});
      if(k==="R")return JSON.stringify({type:"user",message:{role:"user",content:[{type:"tool_result",content:"ok"}]}});
      return "";
    });
    fs.writeFileSync(tx, lines.join("\n")+"\n");
  ' "$@"
}

# $1=label $2=stdin-json $3=expect(fire|silent)
check() {
  out=$(printf '%s' "$2" | node "$HOOK")
  got=silent; [ -n "$out" ] && got=fire
  if [ "$got" = "$3" ]; then echo "ok   - $1"; pass=$((pass+1));
  else echo "FAIL - $1 (expected $3, got $got)"; fail=$((fail+1)); fi
}
IN="{\"stop_hook_active\":false,\"cwd\":\"$GITREPO\",\"transcript_path\":\"$TX\"}"

# --- fires: git-write action in the current turn ---
fixture "P:build the thing" "T:git commit -m \"add feature\"" "A:Committed. All set."
check "fires on git commit this turn" "$IN" fire

fixture "P:ship it" "T:git push origin main" "A:Pushed."
check "fires on git push this turn" "$IN" fire

fixture "P:open the PR" "T:gh pr create --title \"feat\" --body \"x\"" "A:PR opened."
check "fires on gh pr create this turn" "$IN" fire

fixture "P:do it" "R:" "T:git -C /repo commit -m x" "R:" "A:done"
check "fires on git -C ... commit (mid-turn tool calls)" "$IN" fire

# --- silent: no real build action ---
fixture "P:are we done?" "A:Yes, all done — finished, shipped, ready to merge."
check "silent on prose 'done' with no git action" "$IN" silent

fixture "P:check status" "T:git status --porcelain" "A:clean"
check "silent on read-only git (status)" "$IN" silent

# subcommand-parsing: the words commit/push appearing as flag VALUES must not fire
fixture "P:search log" "T:git log --grep=commit" "A:found"
check "silent on git log --grep=commit (word as value)" "$IN" silent

fixture "P:setup" "T:git config push.default simple" "A:set"
check "silent on git config push.default (word as value)" "$IN" silent

fixture "P:list prs" "T:gh pr list --state open" "A:listed"
check "silent on gh pr list (read-only, not create)" "$IN" silent

fixture "P:commit with config" "T:git -c user.email=x commit -m y" "A:committed"
check "fires on git -c k=v commit (global opt before subcmd)" "$IN" fire

fixture "P:say it" "T:echo \"how to git commit\"" "A:done"
check "silent on echo mentioning git commit" "$IN" silent

# turn-scoping: commit was a PRIOR turn; current turn is just a recap → silent
fixture "P:build it" "T:git commit -m x" "A:done" "P:summarize what you did" "A:I committed the feature earlier."
check "silent when commit was a previous turn" "$IN" silent

# --- guards / fail-open ---
fixture "P:build it" "T:git commit -m x" "A:done"
check "loop guard: stop_hook_active" "{\"stop_hook_active\":true,\"cwd\":\"$GITREPO\",\"transcript_path\":\"$TX\"}" silent
check "silent outside a git repo"     "{\"stop_hook_active\":false,\"cwd\":\"/tmp\",\"transcript_path\":\"$TX\"}" silent

fixture "P:review it" "T:git commit -m x" "A:MUNGER round 1: STATUS CLEAN."
check "loop guard: munger in last message" "$IN" silent

check "fail-open on malformed stdin" "not json" silent

echo "---"; echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
