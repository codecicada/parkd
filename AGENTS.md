# Working in parkd

parkd is a Chrome extension (Manifest V3) that parks a window's tabs in a local list and
restores them later. Read [README.md](README.md) for the product in one page.

## Rules

- **Spec first.** Every change starts as an OpenSpec change in `openspec/changes/`.
  No code lands without a proposal, specs and tasks. Project constraints live in
  [openspec/config.yaml](openspec/config.yaml).
- **Simplicity is the feature.** A change that adds a screen, a setting or a permission
  must say in its proposal why the core loop (save, restore, import/export) needs it.
- **Local only.** No network calls, no remote code, no telemetry. Data stays in
  `chrome.storage.local`.
- **Least permissions.** Request only the Chrome permissions a change needs, and name
  them in the proposal.
- **Inspired by, never copied.** The save-all-tabs workflow is common ground. Code, UI,
  wording and assets of other extensions are not. Do not paste them in.
- **Public repository.** Never commit a secret, a store signing key or a `.env` file.

## Layout

| Path | Holds |
|---|---|
| [openspec/specs/](openspec/specs/) | What parkd does today, as requirements |
| [openspec/changes/](openspec/changes/) | Proposed and in-flight changes |
| `.claude/` | OpenSpec commands and skills for Claude Code |
