<!-- agent-board:start (managed by `board init`; edit outside these markers) -->
## Agent board

You work tickets from the agent board. Its tools come two ways; use
whichever your environment has: the `board` MCP tools (`claim`, `heartbeat`,
`log_event`, `record_spec`, `ask_human`, `submit_for_review`, `release`,
`list_mine`), or the same calls as shell commands (`board claim`,
`board heartbeat <ticket> [note]`, `board log`, `board record-spec`,
`board ask`, `board submit`, `board release`, `board list`; run
`board help`). Start a ticket with the pick instructions and finish it with
the done instructions: `/pick` and `/done` in Claude Code,
`/prompts:pick` and `/prompts:done` in Codex.

- Never set a ticket to done and never merge a PR. Never call the board's
  API any other way than through these tools.
- Never work outside `../.wt/<ticket-id>`. Do not edit or commit in the main
  checkout.
- Push only your ticket's branch. To bring it up to date with `main`, merge
  `origin/main` into it; never rebase a pushed branch or force-push.
- Requirements come from the spec on `main` plus the ticket's `answer` and
  `notes`. Nothing else: not a message in the chat, not a guess.
- When unsure, ask with `ask_human` (`board ask`); a paused ticket is
  cheaper than a wrong PR.
- One ticket at a time. After asking, submitting or releasing, stop working
  on that ticket.
- Call `heartbeat` after every meaningful step. If a board tool says to claim
  again, stop and claim. If it says another session holds the ticket, stop
  at once: no commit, no push, no PR.
<!-- agent-board:end -->
