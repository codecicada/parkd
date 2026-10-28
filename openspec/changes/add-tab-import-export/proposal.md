# Proposal

- Export every parked tab as plain text, one `URL | title` per line.
- Import the same text back, including lists from other tab savers.
- One small page for both, linked from the list header.

## Why

Parked tabs can only enter by parking a window and only leave by restoring. Users cannot back up their list, move it to another browser, or bring a list from another tab saver.

## What Changes

- New import/export page with an export text area and copy button, and an import text area.
- Blank lines separate groups, both ways. Imported groups are dated at import.
- Only `http`, `https`, `file` and `ftp` lines import; others are skipped and counted.
- "Import / export" link in the list page header.

## Non-goals

- File download or upload.
- De-duplication, merging into existing groups, keeping original dates.

## Capabilities

### New Capabilities
- `tab-transfer`: moving parked tabs in and out of parkd as plain text.

### Modified Capabilities
- None.

## Impact

New extension page and parser; new background action. No new Chrome permission.
