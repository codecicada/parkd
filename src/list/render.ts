import { sortedGroups } from "../core/groups";
import type { Action } from "../chrome/actions";
import type { Group, ParkdState } from "../core/types";

export type Dispatch = (action: Action) => void;

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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

function renderGroup(group: Group, dispatch: Dispatch): HTMLElement {
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
    const link = el("a", "tab-link", tab.title);
    link.href = tab.url;
    link.title = tab.url;
    link.addEventListener("click", (event) => {
      // A plain click restores; modified clicks keep the browser's own link behavior.
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      dispatch({ type: "restoreTab", groupId: group.id, tabId: tab.id });
    });
    item.append(
      link,
      button("×", "remove", "Remove without opening", () =>
        dispatch({ type: "deleteTab", groupId: group.id, tabId: tab.id }),
      ),
    );
    list.append(item);
  }

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

  container.replaceChildren(...groups.map((group) => renderGroup(group, dispatch)));
}
