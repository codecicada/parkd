import { beforeEach, describe, expect, it } from "vitest";
import { installFakeChrome, type FakeChrome } from "../../test/fake-chrome";
import type { Group, ParkdState } from "../core/types";
import { isAction, runAction } from "./actions";
import { readState, writeState } from "./store";

let fake: FakeChrome;

const group = (id: string, createdAt: number, names: string[]): Group => ({
  id,
  createdAt,
  tabs: names.map((name) => ({ id: name, url: `https://${name}.test/`, title: name })),
});

async function seed(...groups: Group[]): Promise<void> {
  const state: ParkdState = { version: 1, groups };
  await writeState(state);
}

const openUrls = () => fake.tabs.map((t) => t.url);
const parked = async () =>
  (await readState()).groups.map((g) => `${g.id}:${g.tabs.map((t) => t.id).join(",")}`);

beforeEach(() => {
  fake = installFakeChrome();
});

describe("restore", () => {
  it("restores one tab into the window and removes it from its group", async () => {
    await seed(group("g", 1, ["a", "b"]));

    await runAction({ type: "restoreTab", groupId: "g", tabId: "a" }, 7);

    expect(fake.tabs).toMatchObject([{ url: "https://a.test/", windowId: 7, active: true }]);
    expect(await parked()).toEqual(["g:b"]);
  });

  it("removes the group when its last tab is restored", async () => {
    await seed(group("g", 1, ["a"]));

    await runAction({ type: "restoreTab", groupId: "g", tabId: "a" }, 1);

    expect(await parked()).toEqual([]);
  });

  it("restores a group in saved order and removes it", async () => {
    await seed(group("g", 1, ["a", "b", "c"]), group("h", 2, ["d"]));

    await runAction({ type: "restoreGroup", groupId: "g" }, 1);

    expect(openUrls()).toEqual(["https://a.test/", "https://b.test/", "https://c.test/"]);
    expect(await parked()).toEqual(["h:d"]);
  });

  it("restores everything and empties the list", async () => {
    await seed(group("old", 1, ["a"]), group("new", 2, ["b", "c"]));

    await runAction({ type: "restoreAll" }, 1);

    expect(openUrls()).toEqual(["https://b.test/", "https://c.test/", "https://a.test/"]);
    expect(await parked()).toEqual([]);
  });

  it("keeps a tab parked when it cannot be opened", async () => {
    await seed(group("g", 1, ["a", "b"]));
    fake.failOpening("https://a.test/");

    await runAction({ type: "restoreGroup", groupId: "g" }, 1);

    expect(openUrls()).toEqual(["https://b.test/"]);
    expect(await parked()).toEqual(["g:a"]);
  });

  it("ignores a tab that is no longer parked", async () => {
    await seed(group("g", 1, ["a"]));

    await runAction({ type: "restoreTab", groupId: "g", tabId: "gone" }, 1);

    expect(openUrls()).toEqual([]);
    expect(await parked()).toEqual(["g:a"]);
  });
});

describe("delete", () => {
  it("deletes one tab without opening it", async () => {
    await seed(group("g", 1, ["a", "b"]));

    await runAction({ type: "deleteTab", groupId: "g", tabId: "a" }, 1);

    expect(openUrls()).toEqual([]);
    expect(await parked()).toEqual(["g:b"]);
  });

  it("deletes a group without opening it", async () => {
    await seed(group("g", 1, ["a", "b"]), group("h", 2, ["c"]));

    await runAction({ type: "deleteGroup", groupId: "g" }, 1);

    expect(openUrls()).toEqual([]);
    expect(await parked()).toEqual(["h:c"]);
  });
});

describe("isAction", () => {
  it("accepts known actions and rejects anything else", () => {
    expect(isAction({ type: "restoreAll" })).toBe(true);
    expect(isAction({ type: "eval" })).toBe(false);
    expect(isAction(null)).toBe(false);
  });
});
