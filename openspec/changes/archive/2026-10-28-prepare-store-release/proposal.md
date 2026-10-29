# Proposal

- `npm run package` builds the zip the Chrome Web Store takes.
- The repository holds the privacy policy, listing text and images the store asks for.
- Contributors know how to report and contribute.

## Why

parkd is public but not yet publishable: there is no store zip, no privacy policy and no contributor guide.

## What Changes

- Package script, and a check that manifest, package and changelog versions match.
- `PRIVACY.md` and a `store/` folder: listing text, screenshots, promo tile.
- 128px icon re-rendered with store padding.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, issue and PR templates, Dependabot.

## Non-goals

- Uploading to the store, or automating releases.
- GitHub settings: branch protection, private reporting, topics.
- Any change to the extension's behavior.

## Capabilities

### New Capabilities
- `release-packaging`: building the store zip and keeping versions in step.

### Modified Capabilities
- None.

## Impact

Tooling, docs and assets only. No new Chrome permission.
