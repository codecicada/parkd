import { beforeEach, describe, expect, it } from "vitest";
import { EXTENSION_ORIGIN, installFakeChrome, type FakeChrome } from "../../test/fake-chrome";
import { readState } from "./store";
import { parkWindow } from "./park";

const LIST = `${EXTENSION_ORIGIN}list.html`;
let fake: FakeChrome;

beforeEach(() => {
  fake = installFakeChrome();
});

const urls = () => fake.tabs.map((t) => t.url);

describe("parkWindow", () => {
  it("stores parkable tabs as one group, closes them and shows the list", async () => {
    fake.addTab({ url: "https://a.test/", title: "A" });
    fake.addTab({ url: "https://b.test/", title: "B" });
    fake.addTab({ url: "https://c.test/", title: "C" });

    await parkWindow(1, 5000);

    const { groups } = await readState();
    expect(groups).toHaveLength(1);
    expect(groups[0]?.createdAt).toBe(5000);
    expect(groups[0]?.tabs.map((t) => t.title)).toEqual(["A", "B", "C"]);
    expect(urls()).toEqual([LIST]);
    expect(fake.tabs[0]?.active).toBe(true);
  });

  it("leaves pinned tabs and internal pages open", async () => {
    fake.addTab({ url: "https://pinned.test/", pinned: true });
    fake.addTab({ url: "chrome://settings/" });
    fake.addTab({ url: "chrome://newtab/" });
    fake.addTab({ url: "https://a.test/" });
    fake.addTab({ url: "https://b.test/" });

    await parkWindow(1);

    expect((await readState()).groups[0]?.tabs.map((t) => t.url)).toEqual([
      "https://a.test/",
      "https://b.test/",
    ]);
    expect(urls()).toEqual(["https://pinned.test/", "chrome://settings/", "chrome://newtab/", LIST]);
  });

  it("stores nothing and closes nothing when no tab is parkable, but shows the list", async () => {
    fake.addTab({ url: "chrome://newtab/" });

    await parkWindow(1);

    expect((await readState()).groups).toEqual([]);
    expect(urls()).toEqual(["chrome://newtab/", LIST]);
  });

  it("focuses an open list page instead of opening a second one", async () => {
    const list = fake.addTab({ url: LIST });
    fake.addTab({ url: "https://a.test/", active: true });

    await parkWindow(1);

    expect(urls()).toEqual([LIST]);
    expect(fake.tabs[0]?.id).toBe(list.id);
    expect(fake.tabs[0]?.active).toBe(true);
  });

  it("closes no tab when the save fails", async () => {
    fake.addTab({ url: "https://a.test/" });
    fake.failNextWrite();

    await expect(parkWindow(1)).rejects.toThrow();

    expect(urls()).toContain("https://a.test/");
    expect((await readState()).groups).toEqual([]);
  });

  it("only touches the given window", async () => {
    fake.addTab({ url: "https://a.test/", windowId: 1 });
    fake.addTab({ url: "https://other.test/", windowId: 2 });

    await parkWindow(1);

    expect(urls()).toEqual(["https://other.test/", LIST]);
  });

  it("still closes the rest when a tab disappears during the save", async () => {
    const a = fake.addTab({ url: "https://a.test/" });
    fake.addTab({ url: "https://b.test/" });
    const realSet = chrome.storage.local.set;
    chrome.storage.local.set = (async (items: Record<string, unknown>) => {
      fake.tabs.splice(fake.tabs.indexOf(a), 1); // user closes A mid-save
      return realSet(items);
    }) as typeof chrome.storage.local.set;

    await parkWindow(1);

    expect(urls()).toEqual([LIST]);
  });
});
