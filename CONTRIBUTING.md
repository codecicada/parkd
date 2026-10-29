# Contributing to parkd

Thanks for helping. parkd is small on purpose, so the most useful contributions keep it
that way: bug fixes, clearer wording, better accessibility, fewer lines.

## Before you start

- **Bugs:** open an issue with the steps to reproduce it.
- **Ideas:** open an issue first. Say how the idea helps the core loop: save all tabs,
  restore them, import and export them. A new screen, setting or permission needs a
  strong answer.
- **Security problems:** do not open an issue. See [SECURITY.md](SECURITY.md).

## Rules every change follows

- **Local only.** No network requests, no remote code, no telemetry. Data stays in
  `chrome.storage.local`.
- **Least permissions.** parkd uses `tabs` and `storage`. A change that needs another
  permission says which and why.
- **Original work.** The save-all-tabs idea is common ground; another extension's code,
  UI, wording and assets are not. Do not copy them in.
- **No secrets.** Never commit a key, a `.pem`, a `.env` file or a store credential.

## Spec first

Every change starts as an [OpenSpec](https://github.com/Fission-AI/OpenSpec) change in
`openspec/changes/<name>/`, with a proposal, specs and tasks, before any code. The specs
in `openspec/specs/` describe what parkd does today. Project rules for proposals, designs
and tasks are in [openspec/config.yaml](openspec/config.yaml).

The flow is: explore, propose, implement the tasks, open a pull request, CI green,
archive the change, merge. [AGENTS.md](AGENTS.md) has the details.

## Build and test

Needs Node 24 (see `.nvmrc`).

```sh
npm ci
npm test
npm run typecheck
npm run package
```

`npm run package` builds `dist/` and writes `parkd-<version>.zip`. To try your build,
load `dist/` with **Load unpacked** at `chrome://extensions`.

## Pull requests

- One change per pull request, named after its OpenSpec change.
- Tests for new behavior, next to the code (`*.test.ts`).
- CI runs typecheck, tests and the package step; it must be green.
- A release bump updates `package.json`, `public/manifest.json` and `CHANGELOG.md`
  together.

By contributing, you agree that your work is released under the [MIT License](LICENSE)
and that you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
