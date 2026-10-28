// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Group, ParkdState } from "../core/types";
import { render, type Dispatch } from "./render";

let container: HTMLElement;
let summary: HTMLElement;
let restoreAll: HTMLButtonElement;
let dispatch: ReturnType<typeof vi.fn<Dispatch>>;

const group = (id: string, createdAt: number, names: string[]): Group => ({
  id,
  createdAt,
  tabs: names.map((name) => ({ id: name, url: `https://${name}.test/`, title: name })),
});

const show = (...groups: Group[]) => {
  const state: ParkdState = { version: 1, groups };
  render(state, container, summary, restoreAll, dispatch);
};

beforeEach(() => {
  container = document.createElement("main");
  summary = document.createElement("p");
  restoreAll = document.createElement("button");
  dispatch = vi.fn<Dispatch>();
});

describe("render", () => {
  it("lists the newest group first, with its tab count", () => {
    show(group("yesterday", 1000, ["a"]), group("today", 2000, ["b", "c"]));

    const counts = [...container.querySelectorAll(".group-count")].map((n) => n.textContent);
    expect(counts).toEqual(["2 tabs", "1 tab"]);
    expect(summary.textContent).toBe("3 tabs in 2 groups");
    expect(restoreAll.hidden).toBe(false);
  });

  it("says nothing is parked when the list is empty", () => {
    show();

    expect(container.textContent).toContain("Nothing is parked.");
    expect(restoreAll.hidden).toBe(true);
  });

  it("renders titles as text, never as markup", () => {
    show({
      id: "g",
      createdAt: 1,
      tabs: [{ id: "t", url: "https://x.test/", title: "<b>bold</b><img src=x onerror=alert(1)>" }],
    });

    const link = container.querySelector(".tab-link")!;
    expect(link.textContent).toBe("<b>bold</b><img src=x onerror=alert(1)>");
    expect(container.querySelector("b, img")).toBeNull();
  });

  it("restores a tab on a plain click of its title", () => {
    show(group("g", 1, ["a"]));

    const link = container.querySelector<HTMLAnchorElement>(".tab-link")!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ type: "restoreTab", groupId: "g", tabId: "a" });
  });

  it("leaves modified clicks to the browser", () => {
    show(group("g", 1, ["a"]));

    const link = container.querySelector<HTMLAnchorElement>(".tab-link")!;
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("wires group and tab buttons to their actions", () => {
    show(group("g", 1, ["a"]));

    const [restore, del] = container.querySelectorAll<HTMLButtonElement>(".group-head button");
    restore!.click();
    del!.click();
    container.querySelector<HTMLButtonElement>(".remove")!.click();

    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: "restoreGroup", groupId: "g" },
      { type: "deleteGroup", groupId: "g" },
      { type: "deleteTab", groupId: "g", tabId: "a" },
    ]);
  });
});
