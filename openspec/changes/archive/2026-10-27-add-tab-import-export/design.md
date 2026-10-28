# Design

Motivation: see proposal.md. Behavior: see specs/tab-transfer/spec.md. Builds on the `add-tab-parking` design: pure core, thin Chrome adapter, background worker as the only writer. Each decision below is a short ADR.

## 1. Pure text codec in the core

**Context.** Parsing and formatting carry every rule in the spec and must be tested in Node.

**Decision.** `src/core/transfer.ts` holds two pure functions. `formatExport(state)` returns the text, groups newest first, line breaks in titles replaced by spaces. `parseImport(text)` returns `{ blocks: TabInfo-like[][], skipped }`: split on `\r?\n`, trim, blank runs end a block, split each line on its first ` | `, keep a line only if `new URL()` parses it and its protocol is `http:`, `https:`, `file:` or `ftp:`. Empty blocks are dropped.

**Consequences.** Every parsing scenario is a unit test. `formatExport` output parses back to the same groups (round-trip test).

**Alternatives.** A regex per line: shorter, but `new URL()` already defines what a valid URL is and normalizes it.

## 2. The worker parses and stores the import

**Context.** The worker is the only writer (tab-parking design, decision 3). The page needs a report back.

**Decision.** New action `{ type: "importText", text }`. The worker calls `parseImport`, builds one group per block with `createdAt = now - index` so the first block sorts first among them and all sit above older groups, appends them through the serial queue, and replies `{ tabs, groups, skipped }`. `runAction` returns the action's result and `background.ts` passes it to `sendResponse`.

**Consequences.** One parser run, in the place that writes; no second validation to keep in sync. The page shows the report from the reply. Chrome messages carry up to 64 MiB, far above any tab list; a storage quota error rejects the import as a whole, nothing partial is stored, and the page reports the failure. Formats other than `URL | title` and bare URLs are skipped and counted, never guessed.

**Alternatives.** Parse in the page and send groups: the worker would have to re-validate untrusted data anyway, so parsing twice.

## 3. Own page, third Vite input

**Context.** The list page should stay a list.

**Decision.** `transfer.html` at the repo root with `src/transfer/transfer.ts` and shared `src/list/list.css`, added as a third Vite input and emitted as `dist/transfer.html`. The list header gets an "Import / export" link; the page links back to the list. Both are plain same-tab links.

**Consequences.** No new permission. The page is an extension page, so parking skips it like the list page.

**Alternatives.** A panel on the list page: one page fewer, more state on the busiest screen.

## 4. Export stays live; copy uses the Clipboard API

**Context.** The list can change while the page is open.

**Decision.** The export text area is read-only, filled from `readState()` and refreshed on `chrome.storage.onChanged`. Copy calls `navigator.clipboard.writeText` from the click handler; if it rejects, the text is selected so the user can copy it by hand.

**Consequences.** Export always matches storage. The import text area is never touched by refreshes.

**Alternatives.** `clipboardWrite` permission and `document.execCommand("copy")`: a permission for something the user gesture already allows.
