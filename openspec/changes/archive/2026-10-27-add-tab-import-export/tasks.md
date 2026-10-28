# Tasks

## 1. Text codec (`src/core/transfer.ts`)

- [x] 1.1 Implement `formatExport(state)`: groups newest first, tabs in saved order, `URL | title` lines, blank line between groups, line breaks in titles become spaces. Verify: `src/core/transfer.test.ts` covers the spec "Export" and "Title with a line break" scenarios and an empty state.
- [x] 1.2 Implement `parseImport(text)` returning `{ blocks, skipped }`: `\r?\n` split, trim, blank runs end a block, first ` | ` split, URL-as-title fallback. Verify: tests for "Two groups", "URL without title", "Title containing the separator", "Several blank lines", CRLF input.
- [x] 1.3 Add the protocol allowlist (`http:`, `https:`, `file:`, `ftp:`) via `new URL()` in `parseImport`. Verify: tests for "Mixed lines" (2 stored, 3 skipped) and "A block with no valid line".
- [x] 1.4 Add a round-trip test: `parseImport(formatExport(state))` gives the same URLs, titles and grouping. Verify: test passes.

## 2. Worker action (`src/chrome/actions.ts`, `src/background.ts`)

- [x] 2.1 Add `importText` to `Action` and `isAction`; make `runAction` return the action's result (`ImportReport` for import, nothing otherwise). Verify: `npm run typecheck` passes; existing action tests still pass.
- [x] 2.2 Implement the import: parse, build one group per block with `createdAt = now - index`, append through the queue, return `{ tabs, groups, skipped }`. Verify: tests in `src/chrome/actions.test.ts` for "Import next to existing groups" (order on the list), "Duplicates are kept", "Nothing valid" (nothing stored), and a storage failure storing nothing.
- [x] 2.3 Pass the result to `sendResponse` in `src/background.ts`. Verify: `npm run build` passes; acceptance: reply is `{ ok: true, result }` (checked by the headless import run).

## 3. Import/export page

- [x] 3.1 Add `transfer.html` (repo root) as a third input in `vite.config.ts`. Verify: `npm run build` emits `dist/transfer.html`.
- [x] 3.2 Add the "Import / export" link to the `list.html` header and a back link on `transfer.html`, styled in `src/list/list.css`. Verify: both links navigate in the built extension.
- [x] 3.3 Implement `src/transfer/transfer.ts` export side: read-only text area filled from storage, refreshed on `chrome.storage.onChanged`, empty-state message, Copy button using `navigator.clipboard.writeText` with select-on-failure fallback. Verify: Vitest (`jsdom`) test of the render helper for filled and empty state.
- [x] 3.4 Implement the import side: text area, Import button sending `importText`, report line from the reply ("Imported N tabs in M groups, skipped K lines" / "Nothing was imported"), failure message on `{ ok: false }`. Verify: Vitest test of the report wording for both cases.
- [x] 3.5 Update `README.md` with a short "Import and export" section describing the format. Verify: the README example imports as documented.

## 4. Integration check

- [x] 4.1 Extend the headless Chrome run to cover: link from list, export of two groups, Copy, import of mixed text with the report, round trip of export into import, and no request outside the extension. Verify: all checks pass; note results in the PR.
- [x] 4.2 Confirm `dist/manifest.json` still lists only `tabs` and `storage`. Verify: `node -e` read of the manifest prints exactly those two.

## Workflow follow-up

- Open the pull request, verify CI green against the head SHA, archive the change, verify the apply, merge only on explicit request.
