# Proposal

- Park a window's tabs in one toolbar click.
- Restore or delete parked tabs from one list page.
- Ship as a TypeScript + Vite MV3 extension with tests and CI.

## Why

parkd has no code yet. Saving and restoring tabs is the core loop; nothing else is useful without it.

## What Changes

- Toolbar click saves the window's tabs as a dated group, closes them, shows the list.
- List page restores or deletes a tab, a group, or everything.
- Project scaffold: TypeScript, Vite, Vitest, GitHub Actions CI.

## Non-goals

- Import/export (next change).
- Sync, accounts, settings, search, renaming groups.

## Capabilities

### New Capabilities
- `tab-parking`: saving tabs to the local list, listing them, restoring and deleting them.

### Modified Capabilities
- None.

## Impact

New extension source, build and CI. Permissions: `tabs` (read tab URLs and titles), `storage` (keep the list in `chrome.storage.local`). No host permissions.
