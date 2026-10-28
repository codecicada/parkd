# Design

Motivation: see proposal.md. Behavior: see specs/tab-parking/spec.md. Builds on the `add-tab-parking` design: pure core, thin Chrome adapter, background worker as the only writer. Each decision below is a short ADR.

## 1. One pure move in the core

**Context.** Drag and keyboard moves change the same thing: one tab's group and position. The empty-group rule already lives in `removeTab`.

**Decision.** `moveTab(state, fromGroupId, tabId, toGroupId, toIndex)` in `src/core/groups.ts`. `toIndex` is the tab's index in the target group after it has been taken out of its source, clamped to the group's length. A group left empty is removed. An unknown group or tab, or a move to the tab's own place, returns `state` unchanged (same object). A second pure function, `keyboardTarget(groups, groupId, tabId, direction)`, takes groups in display order and returns `{ toGroupId, toIndex }` or `undefined` at the top or bottom of the list.

**Consequences.** Every spec scenario except the DOM ones is a unit test in Node. Returning the same object lets the worker skip the write, so a drop in place stores nothing.

**Alternatives.** Send the whole new tab order from the page: the worker would trust a list built from a possibly stale render, and could drop or duplicate tabs.

## 2. New worker action `moveTab`

**Context.** The worker is the only writer and runs actions through a serial queue.

**Decision.** `{ type: "moveTab", fromGroupId, tabId, toGroupId, toIndex }`. `isAction` checks the three ids are strings and `toIndex` is a non-negative integer. `apply` calls `moveTab`; `runAction` writes only when the state changed.

**Consequences.** A move that races a restore or a delete finds its tab gone and does nothing. No new permission.

**Alternatives.** Two actions, one per group change: more cases, same result.

## 3. Native drag and drop on the row, private data type

**Context.** A plain click on a title restores the tab. Links are draggable by default and carry their URL, which another page or the tab strip would accept.

**Decision.** Each `li.tab` gets `draggable = true` and `data-tab-id`; its link gets `draggable = false`. `dragstart` stores `{ groupId, tabId }` in a page variable and sets only `application/x-parkd-tab` on the `DataTransfer`. Each group's `ul` handles `dragover` and `drop` only when that type is present; the insert index is the number of other rows whose vertical midpoint is above the pointer, computed by a pure helper. A `drop-before` class on the row at the insert point, or `drop-end` on the `ul`, draws the drop line in `src/list/list.css`. `drop` dispatches `moveTab`; `dragend` clears the variable and the classes.

**Consequences.**
- Chrome sends no `click` after a drag, so clicking still restores.
- Drops from outside the page lack the type and are ignored by parkd; Chrome's own handling of a dropped link (opening it in the list page's tab) is unchanged.
- No library.

**Alternatives.** A drag-handle button per row: a larger target to find, more UI. Pointer-event dragging: reimplements what the browser already does.

## 4. Keyboard moves on the focused title

**Context.** Drag is mouse-only.

**Decision.** A `keydown` handler on each tab link reacts to Alt+ArrowUp / Alt+ArrowDown with no other modifier, calls `keyboardTarget` with the rendered groups, and dispatches `moveTab` if it returns a target. The link gets `aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"`.

**Consequences.** Alt+Up/Down is unbound in Chrome on Windows, Linux and macOS. Alt+Left/Right stay the browser's back and forward.

**Alternatives.** Plain arrows: these scroll the page.

## 5. Render keeps focus by tab id

**Context.** `render` replaces the whole list on each storage change, which drops focus.

**Decision.** Before replacing children, `render` reads the `data-tab-id` of the focused element's row; afterwards it focuses that tab's link if it is still listed.

**Consequences.** A tab moved from the keyboard keeps focus, so repeated Alt+Up works. A storage change during a drag replaces the dragged row; the drag then ends without a move, or its drop is checked by the worker (decision 2).

**Alternatives.** Patch the DOM per change instead of re-rendering: more code for a list of a few hundred rows.
