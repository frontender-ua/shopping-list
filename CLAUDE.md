# shopping-list

Tiny test project: `npm test`, `npm run lint`. Specs: `specs/NNN-name/spec.md`.

## Agent board

You work tickets from the agent board through the `board` MCP tools. Start
with `/pick`; finish with `/done`.

- Never set a ticket to done and never merge a PR. Never call the board
  (PocketBase) API directly: use only the `board` tools.
- Never work outside `../.wt/<ticket-id>`. Do not edit or commit in the main
  checkout.
- Push only your ticket's branch. To bring it up to date with `main`, merge
  `origin/main` into it; never rebase a pushed branch or force-push.
- Requirements come from the spec on `main` plus the ticket's `answer` and
  `notes`. Nothing else.
- When unsure, ask with `ask_human`; a paused ticket is cheaper than a wrong PR.
- One ticket at a time. After `ask_human`, `submit_for_review` or `release`,
  stop working on that ticket.
- Call `heartbeat` after every meaningful step. If a board tool says to claim
  again, stop and call `claim`.
