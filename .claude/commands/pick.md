---
description: Take the next ticket from the board and work on it
---

<!-- agent-board: written by `board init`; init updates this file while this line is here -->

Take the next ticket from the board and work on it. Board calls below are
named by their MCP tool; in a shell use the `board` command of the same name
(`claim` is `board claim`, `ask_human` is `board ask`).

1. Call `claim`.
   - If `ticket` is null, say there is nothing to do and stop.
   - If `resumed` is true, you are continuing your own ticket after a restart:
     reuse its worktree (step 4) and pick up where the work stopped.
   - If `claim` fails because another session of yours holds the ticket, say
     so and stop. Do not retry and do not touch its worktree.
2. Read `answer` and `notes` on the ticket. They are additions to the spec:
   answers to earlier questions and review feedback. They override the spec
   where they conflict with it.
3. Read the spec from `main` only, never from the working tree:
   ```
   git fetch origin main
   git show origin/main:<spec_path>/spec.md
   ```
   Then call `record_spec` with the output of `git rev-parse origin/main`.
4. Set up the worktree `../.wt/<ticket id>` and work only inside it:
   - If `../.wt/<ticket id>` already exists, use it as is.
   - Else, if the branch already exists on origin (a review round), run
     `git fetch origin <branch>` and
     `git worktree add ../.wt/<ticket id> -B <branch> origin/<branch>`.
   - Else run `git worktree add ../.wt/<ticket id> -b <branch> origin/main`.
5. Write a short plan (3 to 6 steps) and log it with `log_event`, kind `plan`.
6. Implement step by step. After each step call `heartbeat` with a one-line
   note.
7. If the spec, `answer` and `notes` do not answer something that changes
   behavior, call `ask_human` with one concrete question and stop. Do not
   guess, do not commit, do not open a PR.
8. When the work is complete, follow the done instructions.
