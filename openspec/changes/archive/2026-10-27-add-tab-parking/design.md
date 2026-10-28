# Design

Motivation: see proposal.md. Behavior: see specs/tab-parking/spec.md. Each decision below is a short ADR.

## 1. Build with plain Vite, two entries

**Context.** An MV3 extension needs a background service worker, a list page and a `manifest.json`. TypeScript must compile to what Chrome loads.

**Decision.** Vite builds two inputs: `list.html` at the repo root (emitted as `dist/list.html`) and `src/background.ts` (emitted as `background.js`, ES module). The modulepreload polyfill is off; Chrome supports it natively. `public/manifest.json` is copied to `dist/` unchanged. Chrome loads `dist/`. TypeScript `strict`, `@types/chrome`, Node version pinned in `.nvmrc`, npm with a committed lockfile.

**Consequences.** The manifest stays a hand-written file a reviewer can read. No hot reload: after `npm run build`, reload the extension in `chrome://extensions`.

**Alternatives.** `@crxjs/vite-plugin`: hot reload and a generated manifest, at the cost of one more dependency between source and shipped code. Rejected for now; can be added later without changing behavior.

## 2. Pure core, thin Chrome adapter

**Context.** Tests must run in Node without a browser.

**Decision.** `src/core/` holds pure functions over plain data: which tabs are parkable, building a group, removing a tab or group, ordering. `src/chrome/` holds the only code that calls `chrome.*`. Vitest tests the core directly and the adapter against a small in-memory fake of `chrome.tabs` and `chrome.storage.local`.

**Consequences.** Every spec scenario except the network one maps to a unit test. Real-browser behavior (window survives, focus) is checked by hand on a loaded build.

**Alternatives.** Puppeteer/Playwright end-to-end tests in Chrome. Heavier CI and flaky for extensions; deferred until the core loop grows.

## 3. The background worker is the only writer

**Context.** The service worker writes on save; the list page writes on restore and delete. Two read-modify-write cycles on one storage key can lose an update.

**Decision.** All mutations run in the background worker. The list page sends `chrome.runtime` messages (`restoreTab`, `restoreGroup`, `restoreAll`, `deleteTab`, `deleteGroup`) and only reads storage. The worker applies mutations one at a time through a promise queue.

**Consequences.** No lost updates from concurrent pages. The list page re-renders from `chrome.storage.onChanged`, so every open list stays current.

**Alternatives.** Let each page write directly: simpler, but two list pages, or a save during a delete, can drop data.

## 4. One storage key, versioned

**Context.** The list is small (hundreds of tabs, not millions) and always read whole.

**Decision.** `chrome.storage.local` key `parkd` holds `{ version: 1, groups: Group[] }`. `Group = { id, createdAt, tabs: ParkedTab[] }`, `ParkedTab = { id, url, title }`. IDs are `crypto.randomUUID()`. `createdAt` is epoch milliseconds.

**Consequences.** One read renders the page. `version` lets a later change migrate the shape. `storage.local` has a 10 MB quota by default; at roughly 200 bytes a tab this is tens of thousands of tabs, so `unlimitedStorage` is not requested.

**Alternatives.** One key per group: cheaper partial writes, but listing needs every key and ordering lives outside the data. IndexedDB: more power than this needs.

## 5. Save order: show list, store, then close

**Context.** Closing every tab of a window closes the window; closing before storing can lose tabs.

**Decision.** On toolbar click: read the window's tabs, filter, focus or open the list page in that window, store the group, then close the saved tabs by ID. If storing throws, stop before closing.

**Consequences.** The window always keeps the list page, so it survives. A tab the user closes during the save is simply already gone; `tabs.remove` on a missing ID is ignored.

**Alternatives.** Close first, then store: faster feedback, but a failed write loses tabs.

## 6. List page in plain TypeScript DOM

**Context.** One page, a few lists and buttons.

**Decision.** Render with plain DOM calls and `textContent` (never `innerHTML` with tab data). Minimal CSS in one file, respects `prefers-color-scheme`.

**Consequences.** No UI framework dependency. Tab titles and URLs cannot inject markup.

**Alternatives.** Preact or React: nicer components, but a runtime dependency for one page.

## 7. CI on every pull request

**Context.** The change flow requires a verified green check before archive.

**Decision.** One GitHub Actions workflow, `ci`, runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build` on pull requests and on `main`.

**Consequences.** `dist/` is reproducible from source and the lockfile. Store packaging is not part of this change.

**Alternatives.** Separate jobs per step: clearer logs, slower; not needed yet.
