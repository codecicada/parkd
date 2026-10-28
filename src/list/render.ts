import { keyboardTarget, sortedGroups, type Direction } from "../core/groups";
import type { Action } from "../chrome/actions";
import type { Group, ParkdState } from "../core/types";

export type Dispatch = (action: Action) => void;

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Private drag type: other pages and the tab strip ignore it, and drops without it are not ours. */
const TAB_TYPE = "application/x-parkd-tab";

/** The tab being dragged from this page, if any. */
let dragging: { groupId: string; tabId: string } | undefined;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label: string, className: string, title: string, onClick: () => void) {
  const node = el("button", className, label);
  node.type = "button";
  node.title = title;
  node.addEventListener("click", onClick);
  return node;
}

/** Insert index for a pointer at `y`: how many rows have their midpoint above it. */
export function dropIndex(midpoints: number[], y: number): number {
  return midpoints.filter((mid) => mid < y).length;
}

function clearDropMarks(root: ParentNode) {
  for (const node of root.querySelectorAll(".drop-before, .drop-end")) {
    node.classList.remove("drop-before", "drop-end");
  }
}

/** Wires a group's tab list as a drop target for tabs dragged from this page. */
function acceptDrops(list: HTMLUListElement, group: Group, dispatch: Dispatch) {
  const target = (event: DragEvent) => {
    const source = dragging;
    if (!source || !event.dataTransfer?.types.includes(TAB_TYPE)) return undefined;
    const rows = [...list.querySelectorAll<HTMLElement>(":scope > .tab")].filter(
      (row) => row.dataset.tabId !== source.tabId,
    );
    const midpoints = rows.map((row) => {
      const rect = row.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    return { source, rows, index: dropIndex(midpoints, event.clientY) };
  };

  list.addEventListener("dragover", (event) => {
    const found = target(event);
    if (!found) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
    clearDropMarks(list.closest("main") ?? list);
    const before = found.rows[found.index];
    if (before) before.classList.add("drop-before");
    else list.classList.add("drop-end");
  });

  list.addEventListener("dragleave", (event) => {
    if (!list.contains(event.relatedTarget as Node | null)) clearDropMarks(list);
  });

  list.addEventListener("drop", (event) => {
    const found = target(event);
    if (!found) return;
    event.preventDefault();
    clearDropMarks(list);
    const { source, index } = found;
    const from = group.id === source.groupId && group.tabs.findIndex((t) => t.id === source.tabId);
    if (from === index) return; // dropped where it was
    dispatch({
      type: "moveTab",
      fromGroupId: source.groupId,
      tabId: source.tabId,
      toGroupId: group.id,
      toIndex: index,
    });
  });
}

function renderGroup(group: Group, groups: Group[], dispatch: Dispatch): HTMLElement {
  const section = el("section", "group");

  const head = el("div", "group-head");
  const heading = el("h2", "group-title");
  heading.append(
    el("time", "group-date", dateFormat.format(group.createdAt)),
    el("span", "group-count", plural(group.tabs.length, "tab")),
  );
  heading.querySelector("time")!.dateTime = new Date(group.createdAt).toISOString();
  head.append(
    heading,
    button("Restore", "action", "Open these tabs and remove the group", () =>
      dispatch({ type: "restoreGroup", groupId: group.id }),
    ),
    button("Delete", "action subtle", "Remove the group without opening it", () =>
      dispatch({ type: "deleteGroup", groupId: group.id }),
    ),
  );

  const list = el("ul", "tabs");
  for (const tab of group.tabs) {
    const item = el("li", "tab");
    item.dataset.tabId = tab.id;
    item.setAttribute("draggable", "true");
    item.addEventListener("dragstart", (event) => {
      if (!event.dataTransfer) return;
      dragging = { groupId: group.id, tabId: tab.id };
      event.dataTransfer.setData(TAB_TYPE, tab.id);
      event.dataTransfer.effectAllowed = "move";
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => {
      dragging = undefined;
      item.classList.remove("dragging");
      clearDropMarks(item.closest("main") ?? document);
    });

    const link = el("a", "tab-link", tab.title);
    link.href = tab.url;
    link.title = tab.url;
    // The row drags; the link must not, or it would carry its URL to other pages.
    link.setAttribute("draggable", "false");
    link.setAttribute("aria-keyshortcuts", "Alt+ArrowUp Alt+ArrowDown");
    link.addEventListener("click", (event) => {
      // A plain click restores; modified clicks keep the browser's own link behavior.
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      dispatch({ type: "restoreTab", groupId: group.id, tabId: tab.id });
    });
    link.addEventListener("keydown", (event) => {
      const direction: Direction | undefined =
        event.key === "ArrowUp" ? "up" : event.key === "ArrowDown" ? "down" : undefined;
      if (!direction || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      const to = keyboardTarget(groups, group.id, tab.id, direction);
      if (to) dispatch({ type: "moveTab", fromGroupId: group.id, tabId: tab.id, ...to });
    });
    item.append(
      link,
      button("×", "remove", "Remove without opening", () =>
        dispatch({ type: "deleteTab", groupId: group.id, tabId: tab.id }),
      ),
    );
    list.append(item);
  }
  acceptDrops(list, group, dispatch);

  section.append(head, list);
  return section;
}

/** Renders the whole list into `container` and updates the header. */
export function render(
  state: ParkdState,
  container: HTMLElement,
  summary: HTMLElement,
  restoreAll: HTMLButtonElement,
  dispatch: Dispatch,
): void {
  const groups = sortedGroups(state);
  const tabCount = groups.reduce((n, group) => n + group.tabs.length, 0);

  summary.textContent =
    tabCount === 0 ? "" : `${plural(tabCount, "tab")} in ${plural(groups.length, "group")}`;
  restoreAll.hidden = tabCount === 0;

  if (groups.length === 0) {
    const empty = el("div", "empty");
    empty.append(
      el("p", "empty-title", "Nothing is parked."),
      el("p", "empty-hint", "Click the parkd icon in the toolbar to park this window's tabs here."),
    );
    container.replaceChildren(empty);
    return;
  }

  // Re-rendering replaces every row; keep focus on the same tab, e.g. after a keyboard move.
  const active = document.activeElement;
  const focusedTab = container.contains(active)
    ? active?.closest<HTMLElement>(".tab")?.dataset.tabId
    : undefined;

  container.replaceChildren(...groups.map((group) => renderGroup(group, groups, dispatch)));

  if (focusedTab !== undefined) {
    const row = [...container.querySelectorAll<HTMLElement>(".tab")].find(
      (node) => node.dataset.tabId === focusedTab,
    );
    row?.querySelector<HTMLElement>(".tab-link")?.focus();
  }
}
