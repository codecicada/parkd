import { beforeEach, describe, expect, it } from "vitest";
import { installFakeChrome, type FakeChrome } from "./fake-chrome";

let fake: FakeChrome;
beforeEach(() => {
  fake = installFakeChrome();
});

describe("fake chrome", () => {
  it("queries, creates and removes tabs", async () => {
    const a = fake.addTab({ url: "https://a.test/" });
    await chrome.tabs.create({ windowId: 1, url: "https://b.test/" });
    expect((await chrome.tabs.query({ windowId: 1 })).map((t) => t.url)).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
    await chrome.tabs.remove(a.id);
    expect(fake.tabs.map((t) => t.url)).toEqual(["https://b.test/"]);
  });

  it("rejects removing a missing tab, like Chrome", async () => {
    await expect(chrome.tabs.remove(999)).rejects.toThrow("No tab with id");
  });

  it("stores copies, not references", async () => {
    const value = { n: 1 };
    await chrome.storage.local.set({ k: value });
    value.n = 2;
    expect(await chrome.storage.local.get("k")).toEqual({ k: { n: 1 } });
  });
});
