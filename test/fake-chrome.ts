/** In-memory stand-in for the parts of `chrome.*` parkd uses. */

export const EXTENSION_ORIGIN = "chrome-extension://parkd-test/";

export interface FakeTab {
  id: number;
  windowId: number;
  url: string;
  title: string;
  pinned: boolean;
  active: boolean;
}

export interface FakeChrome {
  api: typeof chrome;
  tabs: FakeTab[];
  storage: Record<string, unknown>;
  /** Makes the next `storage.local.set` reject. */
  failNextWrite(): void;
  /** Makes `tabs.create` reject for this URL. */
  failOpening(url: string): void;
  addTab(tab: Partial<FakeTab> & { url: string; windowId?: number }): FakeTab;
}

export function installFakeChrome(): FakeChrome {
  let nextId = 1;
  let failWrite = false;
  const unopenable = new Set<string>();
  const tabs: FakeTab[] = [];
  const storage: Record<string, unknown> = {};

  const addTab: FakeChrome["addTab"] = (tab) => {
    const created: FakeTab = {
      id: nextId++,
      windowId: 1,
      title: tab.url,
      pinned: false,
      active: false,
      ...tab,
    };
    tabs.push(created);
    return created;
  };

  const setActive = (tab: FakeTab) => {
    for (const other of tabs) if (other.windowId === tab.windowId) other.active = false;
    tab.active = true;
  };

  const api = {
    runtime: {
      id: "parkd-test",
      getURL: (path: string) => EXTENSION_ORIGIN + path,
    },
    tabs: {
      query: async ({ windowId }: { windowId?: number }) =>
        tabs.filter((tab) => windowId === undefined || tab.windowId === windowId).map((t) => ({ ...t })),
      create: async ({ windowId, url, active }: { windowId: number; url: string; active?: boolean }) => {
        if (unopenable.has(url)) throw new Error(`cannot open ${url}`);
        const tab = addTab({ windowId, url });
        if (active !== false) setActive(tab);
        return { ...tab };
      },
      update: async (id: number, { active }: { active?: boolean }) => {
        const tab = tabs.find((t) => t.id === id);
        if (!tab) throw new Error(`No tab with id: ${id}`);
        if (active) setActive(tab);
        return { ...tab };
      },
      remove: async (ids: number | number[]) => {
        const list = Array.isArray(ids) ? ids : [ids];
        const missing = list.find((id) => !tabs.some((t) => t.id === id));
        if (missing !== undefined) throw new Error(`No tab with id: ${missing}`);
        for (const id of list) tabs.splice(tabs.findIndex((t) => t.id === id), 1);
      },
    },
    storage: {
      local: {
        get: async (key: string) => (key in storage ? { [key]: structuredClone(storage[key]) } : {}),
        set: async (items: Record<string, unknown>) => {
          if (failWrite) {
            failWrite = false;
            throw new Error("QUOTA_BYTES quota exceeded");
          }
          for (const [key, value] of Object.entries(items)) storage[key] = structuredClone(value);
        },
      },
    },
  } as unknown as typeof chrome;

  (globalThis as { chrome?: typeof chrome }).chrome = api;

  return {
    api,
    tabs,
    storage,
    addTab,
    failNextWrite: () => {
      failWrite = true;
    },
    failOpening: (url) => {
      unopenable.add(url);
    },
  };
}
