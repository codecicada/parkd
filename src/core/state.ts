import { emptyState, type Group, type ParkdState, type ParkedTab } from "./types";

const isString = (value: unknown): value is string => typeof value === "string";

function isTab(value: unknown): value is ParkedTab {
  const tab = value as ParkedTab;
  return !!tab && isString(tab.id) && isString(tab.url) && isString(tab.title);
}

function isGroup(value: unknown): value is Group {
  const group = value as Group;
  return (
    !!group &&
    isString(group.id) &&
    typeof group.createdAt === "number" &&
    Array.isArray(group.tabs) &&
    group.tabs.every(isTab)
  );
}

/** Reads stored data; anything missing or malformed becomes an empty list. */
export function loadState(raw: unknown): ParkdState {
  const state = raw as ParkdState;
  if (!state || state.version !== 1 || !Array.isArray(state.groups)) return emptyState();
  return { version: 1, groups: state.groups.filter(isGroup) };
}
