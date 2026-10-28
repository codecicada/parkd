import { describe, expect, it } from "vitest";
import { loadState } from "./state";

describe("loadState", () => {
  it("returns an empty list for missing data", () => {
    expect(loadState(undefined)).toEqual({ version: 1, groups: [] });
  });

  it("returns an empty list for an unknown shape or version", () => {
    expect(loadState({ groups: "nope" })).toEqual({ version: 1, groups: [] });
    expect(loadState({ version: 2, groups: [] })).toEqual({ version: 1, groups: [] });
  });

  it("keeps valid groups and drops malformed ones", () => {
    const good = { id: "g", createdAt: 1, tabs: [{ id: "t", url: "https://a.test/", title: "A" }] };
    const bad = { id: "b", createdAt: "yesterday", tabs: [] };
    expect(loadState({ version: 1, groups: [good, bad] })).toEqual({ version: 1, groups: [good] });
  });
});
