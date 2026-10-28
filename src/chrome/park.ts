import { addGroup, buildGroup } from "../core/groups";
import { isParkable } from "../core/parkable";
import { listUrl, openOrFocusList } from "./list-tab";
import { readState, serialize, writeState } from "./store";

/**
 * Parks every parkable tab of a window. The list page is shown first so the window
 * survives, and tabs are closed only once their group is stored.
 */
export async function parkWindow(windowId: number, now = Date.now()): Promise<void> {
  const url = listUrl();
  const tabs = (await chrome.tabs.query({ windowId })).filter(
    (tab) => tab.id !== undefined && isParkable(tab, url),
  );

  await openOrFocusList(windowId);
  if (tabs.length === 0) return;

  const group = buildGroup(tabs, now, () => crypto.randomUUID());
  await serialize(async () => writeState(addGroup(await readState(), group)));

  await closeTabs(tabs.map((tab) => tab.id!));
}

async function closeTabs(ids: number[]): Promise<void> {
  try {
    await chrome.tabs.remove(ids);
  } catch {
    // One tab was closed during the save; close the others one by one.
    await Promise.allSettled(ids.map((id) => chrome.tabs.remove(id)));
  }
}
