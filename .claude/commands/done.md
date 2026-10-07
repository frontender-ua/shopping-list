---
description: Finish the current ticket: test, push, open a PR, submit for review
---

<!-- agent-board: written by `board init`; init updates this file while this line is here -->

Finish the ticket you are working on. Run everything inside its worktree
`../.wt/<ticket id>`. Board calls are named by their MCP tool; in a shell use
the `board` command of the same name (`submit_for_review` is `board submit`).

1. Run the project's tests and linter (for example `npm test`,
   `npm run lint`; use what the project has). If they fail, fix them. If you
   cannot, call `log_event` kind `warn` with what fails, then `ask_human`,
   and stop.
2. Commit with a clear message and push the branch:
   `git push -u origin <branch>`.
3. Open a PR against `main` with `gh pr create`. Title: the ticket title.
   The body names the ticket id, the spec path and the spec commit
   (`record_spec`). If a PR for the branch already exists
   (`gh pr view <branch>`), the push updates it; use its URL.
4. Call `heartbeat`, then `submit_for_review` with the PR URL and a 2 to 4
   line summary of what changed. If your tool tells you what this work cost
   (tokens, cost), pass it as `usage`; otherwise leave it out.
5. Do not mark the ticket done and do not merge the PR. A human does that.
   Stop here.
