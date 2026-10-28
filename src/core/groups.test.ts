import { describe, expect, it } from "vitest";
import { addGroup, buildGroup, clearAll, removeGroup, removeTab, sortedGroups } from "./groups";
import { emptyState, type Group } from "./types";

const counter = () => {
  let n = 0;
  return () => `id${++n}`;
};

const group = (id: string, createdAt: number, tabIds: string[]): Group => ({
  id,
  createdAt,
  tabs: tabIds.map((tabId) => ({ id: tabId, url: `https://${tabId}.test/`, title: tabId })),
});

describe("buildGroup", () => {
  it("keeps window order, URL, title and save time", () => {
    const g = buildGroup(
      [
        { url: "https://a.test/", title: "A", pinned: false },
        { url: "https://b.test/", title: "B", pinned: false },
      ],
      1234,
      counter(),
    );
    expect(g.createdAt).toBe(1234);
    expect(g.tabs.map((t) => [t.url, t.title])).toEqual([
      ["https://a.test/", "A"],
      ["https://b.test/", "B"],
    ]);
    expect(new Set([g.id, ...g.tabs.map((t) => t.id)]).size).toBe(3);
  });

  it("falls back to the URL when a tab has no title", () => {
    const g = buildGroup([{ url: "https://a.test/", title: "", pinned: false }], 0, counter());
    expect(g.tabs[0]?.title).toBe("https://a.test/");
  });
});

describe("addGroup", () => {
  it("adds a group", () => {
    const state = addGroup(emptyState(), group("g", 1, ["t"]));
    expect(state.groups).toHaveLength(1);
  });

  it("never stores an empty group", () => {
    const state = emptyState();
    expect(addGroup(state, group("g", 1, []))).toBe(state);
  });
});

describe("removeTab", () => {
  it("removes one tab and keeps the rest", () => {
    const state = addGroup(emptyState(), group("g", 1, ["a", "b"]));
    const next = removeTab(state, "g", "a");
    expect(next.groups[0]?.tabs.map((t) => t.id)).toEqual(["b"]);
  });

  it("removes a group whose last tab goes", () => {
    const state = addGroup(emptyState(), group("g", 1, ["a"]));
    expect(removeTab(state, "g", "a").groups).toEqual([]);
  });

  it("leaves other groups alone", () => {
    let state = addGroup(emptyState(), group("g1", 1, ["a"]));
    state = addGroup(state, group("g2", 2, ["a"]));
    expect(removeTab(state, "g1", "a").groups.map((g) => g.id)).toEqual(["g2"]);
  });
});

describe("removeGroup and clearAll", () => {
  it("removes one group", () => {
    let state = addGroup(emptyState(), group("g1", 1, ["a"]));
    state = addGroup(state, group("g2", 2, ["b"]));
    expect(removeGroup(state, "g1").groups.map((g) => g.id)).toEqual(["g2"]);
  });

  it("clears everything", () => {
    const state = addGroup(emptyState(), group("g", 1, ["a"]));
    expect(clearAll(state).groups).toEqual([]);
  });
});

describe("sortedGroups", () => {
  it("lists the newest group first", () => {
    let state = addGroup(emptyState(), group("yesterday", 1000, ["a"]));
    state = addGroup(state, group("today", 2000, ["b"]));
    expect(sortedGroups(state).map((g) => g.id)).toEqual(["today", "yesterday"]);
  });
});
