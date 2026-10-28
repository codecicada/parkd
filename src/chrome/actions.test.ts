import { beforeEach, describe, expect, it } from "vitest";
import { installFakeChrome, type FakeChrome } from "../../test/fake-chrome";
import type { Group, ParkdState } from "../core/types";
import { sortedGroups } from "../core/groups";
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

describe("importText", () => {
  it("adds one group per block, above older groups and in the text's order", async () => {
    await seed(group("existing", 1, ["x"]));

    const report = await runAction(
      { type: "importText", text: "https://a.test/ | A\n\nhttps://b.test/ | B\nhttps://c.test/" },
      1,
      5000,
    );

    expect(report).toEqual({ tabs: 3, groups: 2, skipped: 0 });
    const { groups } = await readState();
    expect(groups).toHaveLength(3);
    const order = sortedGroups({ version: 1, groups }).map((g) => g.tabs.map((t) => t.title).join(","));
    expect(order).toEqual(["A", "B,https://c.test/", "x"]);
    expect(openUrls()).toEqual([]);
  });

  it("keeps duplicates", async () => {
    await seed(group("g", 1, ["a"]));

    await runAction({ type: "importText", text: "https://a.test/" }, 1);

    const urls = (await readState()).groups.flatMap((g) => g.tabs.map((t) => t.url));
    expect(urls).toEqual(["https://a.test/", "https://a.test/"]);
  });

  it("stores nothing when no line is valid", async () => {
    await seed(group("g", 1, ["a"]));

    const report = await runAction({ type: "importText", text: "javascript:alert(1)\nnope" }, 1);

    expect(report).toEqual({ tabs: 0, groups: 0, skipped: 2 });
    expect(await parked()).toEqual(["g:a"]);
  });

  it("stores nothing when the write fails", async () => {
    await seed(group("g", 1, ["a"]));
    fake.failNextWrite();

    await expect(runAction({ type: "importText", text: "https://b.test/" }, 1)).rejects.toThrow();

    expect(await parked()).toEqual(["g:a"]);
  });

  it("rejects an import message without text", () => {
    expect(isAction({ type: "importText", text: "x" })).toBe(true);
    expect(isAction({ type: "importText" })).toBe(false);
  });
});

describe("moveTab", () => {
  const move = (fromGroupId: string, tabId: string, toGroupId: string, toIndex: number) =>
    runAction({ type: "moveTab", fromGroupId, tabId, toGroupId, toIndex }, 1);

  it("stores the new order, and restoring follows it", async () => {
    await seed(group("g", 1, ["a", "b", "c"]));

    await move("g", "c", "g", 0);
    expect(await parked()).toEqual(["g:c,a,b"]);

    await runAction({ type: "restoreGroup", groupId: "g" }, 1);
    expect(openUrls()).toEqual(["https://c.test/", "https://a.test/", "https://b.test/"]);
  });

  it("moves a tab into another group and drops the emptied one", async () => {
    await seed(group("g", 1, ["a"]), group("h", 2, ["b"]));

    await move("g", "a", "h", 1);

    expect(await parked()).toEqual(["h:b,a"]);
    expect(openUrls()).toEqual([]);
  });

  it("writes nothing for a move in place", async () => {
    await seed(group("g", 1, ["a", "b"]));
    fake.failNextWrite();

    await expect(move("g", "a", "g", 0)).resolves.toBeUndefined();
    expect(await parked()).toEqual(["g:a,b"]);
  });

  it("rejects a move message with a missing id or a bad index", () => {
    const ok = { type: "moveTab", fromGroupId: "g", tabId: "a", toGroupId: "h", toIndex: 0 };
    expect(isAction(ok)).toBe(true);
    expect(isAction({ ...ok, tabId: undefined })).toBe(false);
    expect(isAction({ ...ok, toIndex: -1 })).toBe(false);
    expect(isAction({ ...ok, toIndex: 1.5 })).toBe(false);
    expect(isAction({ ...ok, toIndex: "0" })).toBe(false);
  });
});
