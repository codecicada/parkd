# Tasks

## 1. README

- [x] 1.1 Add a `## Install` section to `README.md`, between the intro and `## What it does`, linking https://chromewebstore.google.com/detail/parkd/flhndmklpddhnhlnoepaaelgmkoejeme (no query string). Verify: `grep -c '^## Install' README.md` prints 1, `grep -c 'detail/parkd/flhndmklpddhnhlnoepaaelgmkoejeme)' README.md` prints 1, and the sections around it are intact.

## Workflow follow-up

- Open the pull request, verify CI green against the head SHA, archive the change, verify the apply, merge only on explicit request.
