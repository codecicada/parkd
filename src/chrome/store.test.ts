import { beforeEach, describe, expect, it } from "vitest";
import { installFakeChrome } from "../../test/fake-chrome";
import { addGroup } from "../core/groups";
import { readState, serialize, writeState } from "./store";

beforeEach(() => {
  installFakeChrome();
});

const group = (id: string) => ({
  id,
  createdAt: 1,
  tabs: [{ id: `${id}-t`, url: `https://${id}.test/`, title: id }],
});

describe("store", () => {
  it("reads an empty list when nothing is stored", async () => {
    expect(await readState()).toEqual({ version: 1, groups: [] });
  });

  it("lands both of two concurrent mutations", async () => {
    const add = (id: string) =>
      serialize(async () => {
        const state = await readState();
        await new Promise((resolve) => setTimeout(resolve, 5));
        await writeState(addGroup(state, group(id)));
      });
    await Promise.all([add("a"), add("b")]);
    expect((await readState()).groups.map((g) => g.id)).toEqual(["a", "b"]);
  });

  it("keeps running after a failed mutation", async () => {
    await expect(serialize(async () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    await serialize(async () => writeState(addGroup(await readState(), group("c"))));
    expect((await readState()).groups).toHaveLength(1);
  });
});
