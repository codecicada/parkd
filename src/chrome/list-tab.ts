export const listUrl = (): string => chrome.runtime.getURL("list.html");

/** Focuses the list page in `windowId`, opening it there if it is not open yet. */
export async function openOrFocusList(windowId: number): Promise<void> {
  const url = listUrl();
  const tabs = await chrome.tabs.query({ windowId });
  const existing = tabs.find((tab) => tab.url?.startsWith(url) && tab.id !== undefined);
  if (existing) {
    await chrome.tabs.update(existing.id!, { active: true });
  } else {
    await chrome.tabs.create({ windowId, url, active: true });
  }
}
