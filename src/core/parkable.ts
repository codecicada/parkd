import type { TabInfo } from "./types";

// Browser-internal pages rarely restore cleanly, so they stay where they are.
const INTERNAL_PREFIXES = [
  "chrome://",
  "chrome-extension://",
  "chrome-untrusted://",
  "devtools://",
  "edge://",
  "about:",
];

/** Whether a tab gets parked. `listUrl` is the list page, which is never parked. */
export function isParkable(tab: TabInfo, listUrl: string): boolean {
  if (tab.pinned) return false;
  const url = tab.url ?? "";
  if (url === "" || url.startsWith(listUrl)) return false;
  return !INTERNAL_PREFIXES.some((prefix) => url.startsWith(prefix));
}
