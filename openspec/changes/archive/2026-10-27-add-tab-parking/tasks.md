# Tasks

## 1. Scaffold

- [x] 1.1 Add `.nvmrc` (Node 24) and `package.json` with scripts `dev`, `build`, `typecheck`, `test`; devDependencies `typescript`, `vite`, `vitest`, `@types/chrome`, `@types/node`, `jsdom`. Verify: `npm install` succeeds and writes `package-lock.json`.
- [x] 1.2 Add `tsconfig.json` (`strict`, bundler resolution, `types: ["chrome"]`) and `tsconfig.node.json` for `vite.config.ts`. Verify: `npm run typecheck` exits 0.
- [x] 1.3 Add `vite.config.ts` with inputs `list.html` (repo root) and `src/background.ts`, output `background.js` at `dist/` root, no modulepreload polyfill. Verify: `npm run build` emits `dist/background.js` and `dist/list.html`.
- [x] 1.4 Add `public/manifest.json`: MV3, name `parkd`, `background.service_worker: "background.js"` with `type: "module"`, `action` with no popup, permissions `tabs` and `storage` only. Verify: `dist/manifest.json` exists after build; acceptance: no `host_permissions` key.
- [x] 1.5 Add placeholder icons `public/icons/16.png`, `48.png`, `128.png` (original artwork) and reference them in the manifest. Verify: build, then "Load unpacked" `dist/` in Chrome shows the parkd icon with no manifest error.

## 2. Core logic (`src/core/`)

- [x] 2.1 Define types `ParkedTab`, `Group`, `ParkdState` (`version: 1`) in `src/core/types.ts`. Verify: `npm run typecheck` passes.
- [x] 2.2 Implement `isParkable(tab, listUrl)` in `src/core/parkable.ts`: false for pinned, `chrome://`, `chrome-extension://`, `about:blank`, `chrome://newtab`, and the list page. Verify: `src/core/parkable.test.ts` covers each case; acceptance: matches spec "Skip tabs that are not parkable".
- [x] 2.3 Implement `buildGroup(tabs, now, newId)` in `src/core/groups.ts`, keeping window order and capturing URL and title. Verify: test asserts order, `createdAt`, fields.
- [x] 2.4 Implement `addGroup`, `removeTab`, `removeGroup`, `clearAll` in `src/core/groups.ts`; `removeTab` drops a group left empty. Verify: tests cover each, including "No empty groups".
- [x] 2.5 Implement `sortedGroups(state)` newest first. Verify: test with two groups.
- [x] 2.6 Implement `loadState(raw)` returning an empty v1 state for missing or malformed data. Verify: tests for `undefined`, wrong shape, valid v1.

## 3. Chrome adapter and background (`src/chrome/`, `src/background.ts`)

- [x] 3.1 Add an in-memory fake of `chrome.tabs` and `chrome.storage.local` in `test/fake-chrome.ts`. Verify: a smoke test can query, create, remove tabs and get/set storage.
- [x] 3.2 Implement `src/chrome/store.ts` (`readState`, `writeState` on key `parkd`) and a serial mutation queue. Verify: test that two queued mutations both land.
- [x] 3.3 Implement `openOrFocusList(windowId)` in `src/chrome/list-tab.ts`. Verify: tests for "list already open" (focus, no new tab) and "not open" (one new tab).
- [x] 3.4 Implement `parkWindow(windowId)` in `src/chrome/park.ts`: filter, show list, store, then close saved tabs. Verify: tests for spec scenarios "Window with parkable tabs", "Nothing to park", and "Storage write fails" (no tab closed).
- [x] 3.5 Implement restore and delete handlers in `src/chrome/actions.ts` (`restoreTab`, `restoreGroup`, `restoreAll`, `deleteTab`, `deleteGroup`), opening tabs in the sender's window in saved order. Verify: tests for each spec scenario under "Restore removes from the list" and "Delete without restoring".
- [x] 3.6 Wire `src/background.ts`: `chrome.action.onClicked` calls `parkWindow`; `chrome.runtime.onMessage` dispatches to the handlers through the queue. Verify: `npm run build` passes; manual: clicking the icon parks a window.

## 4. List page (`src/list/`)

- [x] 4.1 Add `list.html` and `src/list/list.css` (light and dark via `prefers-color-scheme`). Verify: page loads from the built extension with no console error.
- [x] 4.2 Implement `src/list/render.ts`: groups newest first with date/time and tab count, tab titles as links, empty state, using `textContent` only. Verify: Vitest (`jsdom` environment) in `src/list/render.test.ts` asserts order, empty state, and that a title containing `<b>` renders as text.
- [x] 4.3 Implement `src/list/list.ts`: initial render, re-render on `chrome.storage.onChanged`, buttons sending restore/delete messages. Verify: manual on a loaded build: restore tab, restore group, restore all, delete tab, delete group each behave per spec.
- [x] 4.4 Make a tab title click restore that tab (not plain navigation). Verify: manual: clicking a title opens it in the current window and removes it from the list.

## 5. CI and docs

- [x] 5.1 Add `.github/workflows/ci.yml` running `npm ci`, `npm run typecheck`, `npm test`, `npm run build` on `pull_request` and `push` to `main`. Verify: workflow runs green on the PR.
- [x] 5.2 Update `README.md` with "Build and load locally" (`npm ci`, `npm run build`, Load unpacked `dist/`) and the two permissions with reasons. Verify: following the steps from a fresh clone loads the extension.

## 6. Integration check

- [x] 6.1 Manual pass on a loaded build against every scenario in `specs/tab-parking/spec.md`, including browser restart and window staying open after parking all tabs. Verify: each scenario observed; note results in the PR description.
- [x] 6.2 Confirm no network use: DevTools Network panel on the list page and service worker shows no request during park, restore, delete. Verify: empty request log noted in the PR.

## Workflow follow-up

- Open the pull request, verify CI green against the head SHA, archive the change, verify the apply, merge only on explicit request.
