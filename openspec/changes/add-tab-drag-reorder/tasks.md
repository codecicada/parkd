# Tasks

## 1. Pure move (`src/core/groups.ts`)

- [x] 1.1 Implement `moveTab(state, fromGroupId, tabId, toGroupId, toIndex)`: take the tab out, insert at clamped `toIndex` in the target, drop an emptied source group, return the same `state` object for unknown ids or a move in place. Verify: `src/core/groups.test.ts` covers "Within a group", "Into another group" (dates and group order unchanged), "Last tab of a group", "Dropped where it was" (`toBe(state)`), unknown ids and an out-of-range index.
- [x] 1.2 Implement `keyboardTarget(groups, groupId, tabId, direction)` over groups in display order: one place up or down, end of the group above or start of the group below at an edge, `undefined` at the list's top or bottom. Verify: tests for "One place up", "Across a group edge" (both directions) and "Top of the list" (and bottom).

## 2. Worker action (`src/chrome/actions.ts`)

- [x] 2.1 Add `moveTab` to `Action`, `ACTION_TYPES` and `isAction` (string ids, non-negative integer `toIndex`). Verify: `src/chrome/actions.test.ts` rejects a missing id, a negative or fractional `toIndex`; `npm run typecheck` passes.
- [x] 2.2 Handle `moveTab` in `apply` with `moveTab`; no write when the state is unchanged. Verify: action tests show a stored move, then restoring that group opens tabs in the new order through the fake Chrome; a move in place leaves storage unwritten.

## 3. List page (`src/list/render.ts`, `src/list/list.css`)

- [x] 3.1 Render rows with `draggable = true` and `data-tab-id`, links with `draggable = false` and `aria-keyshortcuts`. Verify: `src/list/render.test.ts` checks the attributes; the existing click-restores test still passes.
- [x] 3.2 Add a pure `dropIndex(midpoints, y)` helper and its tests (above all, between, below all, empty list). Verify: `npm test` passes.
- [x] 3.3 Wire drag: `dragstart` sets only `application/x-parkd-tab` and the page's drag source; group `ul` `dragover`/`drop` act only on that type, set `drop-before`/`drop-end`, dispatch `moveTab` unless in place; `dragend` clears state and classes. Style the drop line in `list.css`. Verify: render test dispatching synthetic `dragstart`/`dragover`/`drop` events sends the expected `moveTab`; a `drop` without the type dispatches nothing.
- [x] 3.4 Handle Alt+ArrowUp/Down on tab links via `keyboardTarget`, `preventDefault` when handled. Verify: render tests dispatch the key and expect `moveTab`; Alt+Up on the first tab and Ctrl+Alt+Up dispatch nothing.
- [x] 3.5 Keep focus by tab id across `render`. Verify: render test focuses B's link, re-renders with B moved, and `document.activeElement` is B's link.
- [x] 3.6 Add one line to the README "What it does" list: reorder by dragging a tab or with Alt+Up/Down. Verify: README reads correctly.

## 4. Integration check

- [x] 4.1 Load the built `dist/` in headless Chrome: drag within a group, drag into another group (emptying one), drop in place, click still restores, Alt+Up across a group edge with focus kept, restore order and export order follow the move, no request outside the extension. Verify: all pass; note results in the PR.
- [x] 4.2 Confirm `dist/manifest.json` still lists only `tabs` and `storage`. Verify: `node -e` read of the manifest prints exactly those two.

## Workflow follow-up

- Open the pull request, verify CI green against the head SHA, archive the change, verify the apply, merge only on explicit request.
