import { addGroup, findGroup, moveTab, removeGroup, removeTab, sortedGroups } from "../core/groups";
import { parseImport } from "../core/transfer";
import type { ParkdState, ParkedTab } from "../core/types";
import { readState, serialize, writeState } from "./store";

export type Action =
  | { type: "restoreTab"; groupId: string; tabId: string }
  | { type: "restoreGroup"; groupId: string }
  | { type: "restoreAll" }
  | { type: "deleteTab"; groupId: string; tabId: string }
  | { type: "deleteGroup"; groupId: string }
  | { type: "moveTab"; fromGroupId: string; tabId: string; toGroupId: string; toIndex: number }
  | { type: "importText"; text: string };

export interface ImportReport {
  tabs: number;
  groups: number;
  skipped: number;
}

const ACTION_TYPES = new Set<string>([
  "restoreTab",
  "restoreGroup",
  "restoreAll",
  "deleteTab",
  "deleteGroup",
  "moveTab",
  "importText",
]);

export function isAction(value: unknown): value is Action {
  if (!value || !ACTION_TYPES.has((value as Action).type)) return false;
  const action = value as Action;
  if (action.type === "importText") return typeof action.text === "string";
  if (action.type === "moveTab") {
    return (
      [action.fromGroupId, action.tabId, action.toGroupId].every((id) => typeof id === "string") &&
      Number.isInteger(action.toIndex) &&
      action.toIndex >= 0
    );
  }
  return true;
}

/**
 * Applies one action from an extension page. `windowId` is the window that page is in.
 * Resolves to the import report for `importText`, and to nothing otherwise.
 */
export function runAction(
  action: Action,
  windowId: number,
  now = Date.now(),
): Promise<ImportReport | undefined> {
  return serialize(async () => {
    const state = await readState();
    if (action.type === "importText") {
      const { next, report } = importText(state, action.text, now);
      if (next !== state) await writeState(next);
      return report;
    }
    const next = await apply(state, action, windowId);
    if (next !== state) await writeState(next);
    return undefined;
  });
}

/**
 * Adds one group per block. Each group is 1 ms older than the one before it, so the
 * blocks keep the text's order on the newest-first list and sit above older groups.
 */
function importText(state: ParkdState, text: string, now: number) {
  const { blocks, skipped } = parseImport(text);
  let next = state;
  blocks.forEach((tabs, index) => {
    next = addGroup(next, {
      id: crypto.randomUUID(),
      createdAt: now - index,
      tabs: tabs.map((tab) => ({ id: crypto.randomUUID(), ...tab })),
    });
  });
  const report: ImportReport = {
    tabs: blocks.reduce((n, tabs) => n + tabs.length, 0),
    groups: blocks.length,
    skipped,
  };
  return { next, report };
}

async function apply(
  state: ParkdState,
  action: Exclude<Action, { type: "importText" }>,
  windowId: number,
): Promise<ParkdState> {
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
    case "moveTab":
      return moveTab(state, action.fromGroupId, action.tabId, action.toGroupId, action.toIndex);
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
