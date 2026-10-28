import { findGroup, removeGroup, removeTab, sortedGroups } from "../core/groups";
import type { ParkdState, ParkedTab } from "../core/types";
import { readState, serialize, writeState } from "./store";

export type Action =
  | { type: "restoreTab"; groupId: string; tabId: string }
  | { type: "restoreGroup"; groupId: string }
  | { type: "restoreAll" }
  | { type: "deleteTab"; groupId: string; tabId: string }
  | { type: "deleteGroup"; groupId: string };

const ACTION_TYPES = new Set<string>([
  "restoreTab",
  "restoreGroup",
  "restoreAll",
  "deleteTab",
  "deleteGroup",
]);

export function isAction(value: unknown): value is Action {
  return !!value && ACTION_TYPES.has((value as Action).type);
}

/** Applies one list-page action. `windowId` is the window the list page is in. */
export function runAction(action: Action, windowId: number): Promise<void> {
  return serialize(async () => {
    const state = await readState();
    const next = await apply(state, action, windowId);
    if (next !== state) await writeState(next);
  });
}

async function apply(state: ParkdState, action: Action, windowId: number): Promise<ParkdState> {
  switch (action.type) {
    case "restoreTab": {
      const tab = findGroup(state, action.groupId)?.tabs.find((t) => t.id === action.tabId);
      if (!tab) return state;
      const [opened] = await openTabs([tab], windowId, true);
      return opened ? removeTab(state, action.groupId, tab.id) : state;
    }
    case "restoreGroup": {
      const group = findGroup(state, action.groupId);
      if (!group) return state;
      const opened = await openTabs(group.tabs, windowId, false);
      return removeOpened(state, group.id, group.tabs, opened);
    }
    case "restoreAll": {
      let next = state;
      for (const group of sortedGroups(state)) {
        const opened = await openTabs(group.tabs, windowId, false);
        next = removeOpened(next, group.id, group.tabs, opened);
      }
      return next;
    }
    case "deleteTab":
      return removeTab(state, action.groupId, action.tabId);
    case "deleteGroup":
      return removeGroup(state, action.groupId);
  }
}

/**
 * Opens tabs in order, one at a time so they keep that order in the tab strip.
 * Returns, per tab, whether it opened; a tab that fails to open stays parked.
 */
async function openTabs(tabs: ParkedTab[], windowId: number, active: boolean): Promise<boolean[]> {
  const opened: boolean[] = [];
  for (const tab of tabs) {
    try {
      await chrome.tabs.create({ windowId, url: tab.url, active });
      opened.push(true);
    } catch {
      opened.push(false);
    }
  }
  return opened;
}

function removeOpened(
  state: ParkdState,
  groupId: string,
  tabs: ParkedTab[],
  opened: boolean[],
): ParkdState {
  return tabs.reduce(
    (next, tab, i) => (opened[i] ? removeTab(next, groupId, tab.id) : next),
    state,
  );
}
