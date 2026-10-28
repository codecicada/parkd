import type { Group, ParkdState, TabInfo } from "./types";

/** Builds a group from tabs in window order. Tabs without a URL are dropped. */
export function buildGroup(tabs: TabInfo[], now: number, newId: () => string): Group {
  return {
    id: newId(),
    createdAt: now,
    tabs: tabs
      .filter((tab) => tab.url)
      .map((tab) => ({ id: newId(), url: tab.url!, title: tab.title || tab.url! })),
  };
}

export function addGroup(state: ParkdState, group: Group): ParkdState {
  if (group.tabs.length === 0) return state;
  return { ...state, groups: [...state.groups, group] };
}

/** Removes one tab; a group left empty is removed with it. */
export function removeTab(state: ParkdState, groupId: string, tabId: string): ParkdState {
  const groups = state.groups
    .map((group) =>
      group.id === groupId
        ? { ...group, tabs: group.tabs.filter((tab) => tab.id !== tabId) }
        : group,
    )
    .filter((group) => group.tabs.length > 0);
  return { ...state, groups };
}

/**
 * Moves one tab to `toIndex` in `toGroupId`, counted after the tab is taken out.
 * A group left empty is removed. Unknown ids or a move in place return `state` itself.
 */
export function moveTab(
  state: ParkdState,
  fromGroupId: string,
  tabId: string,
  toGroupId: string,
  toIndex: number,
): ParkdState {
  const from = findGroup(state, fromGroupId);
  const to = findGroup(state, toGroupId);
  const fromIndex = from?.tabs.findIndex((tab) => tab.id === tabId) ?? -1;
  if (!from || !to || fromIndex < 0) return state;

  const tab = from.tabs[fromIndex]!;
  const rest = (group: Group) => group.tabs.filter((t) => t.id !== tabId);
  const index = Math.min(Math.max(0, toIndex), rest(to).length);
  if (from === to && index === fromIndex) return state;

  const groups = state.groups
    .map((group) => {
      if (group !== from && group !== to) return group;
      const tabs = rest(group);
      if (group === to) tabs.splice(index, 0, tab);
      return { ...group, tabs };
    })
    .filter((group) => group.tabs.length > 0);
  return { ...state, groups };
}

export type Direction = "up" | "down";

/**
 * Where a keyboard move sends a tab, over groups in display order: one place up or down,
 * or across into the next group at an edge. `undefined` at the top or bottom of the list.
 */
export function keyboardTarget(
  groups: Group[],
  groupId: string,
  tabId: string,
  direction: Direction,
): { toGroupId: string; toIndex: number } | undefined {
  const g = groups.findIndex((group) => group.id === groupId);
  const index = groups[g]?.tabs.findIndex((tab) => tab.id === tabId) ?? -1;
  if (index < 0) return undefined;
  const group = groups[g]!;

  if (direction === "up") {
    if (index > 0) return { toGroupId: group.id, toIndex: index - 1 };
    const above = groups[g - 1];
    return above && { toGroupId: above.id, toIndex: above.tabs.length };
  }
  if (index < group.tabs.length - 1) return { toGroupId: group.id, toIndex: index + 1 };
  const below = groups[g + 1];
  return below && { toGroupId: below.id, toIndex: 0 };
}

export function removeGroup(state: ParkdState, groupId: string): ParkdState {
  return { ...state, groups: state.groups.filter((group) => group.id !== groupId) };
}

export function clearAll(state: ParkdState): ParkdState {
  return { ...state, groups: [] };
}

export function findGroup(state: ParkdState, groupId: string): Group | undefined {
  return state.groups.find((group) => group.id === groupId);
}

/** Newest group first. */
export function sortedGroups(state: ParkdState): Group[] {
  return [...state.groups].sort((a, b) => b.createdAt - a.createdAt);
}
