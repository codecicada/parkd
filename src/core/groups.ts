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
