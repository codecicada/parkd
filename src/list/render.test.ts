// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Group, ParkdState } from "../core/types";
import { dropIndex, render, type Dispatch } from "./render";

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

describe("reordering", () => {
  const rows = () => [...container.querySelectorAll<HTMLElement>(".tab")];
  const row = (tabId: string) => rows().find((node) => node.dataset.tabId === tabId)!;
  const link = (tabId: string) => row(tabId).querySelector<HTMLAnchorElement>(".tab-link")!;

  /** A drag event as Chrome sends it; jsdom has no DragEvent or DataTransfer. */
  function drag(target: Element, type: string, clientY = 0, types = ["application/x-parkd-tab"]) {
    const data = new Map<string, string>();
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, {
      clientY,
      dataTransfer: {
        types,
        setData: (format: string, value: string) => data.set(format, value),
        dropEffect: "none",
        effectAllowed: "all",
      },
    });
    target.dispatchEvent(event);
    return event;
  }

  /** Rows 20px tall, stacked from y = 0 in display order. */
  function layOut() {
    rows().forEach((node, i) => {
      node.getBoundingClientRect = () => ({ top: i * 20, height: 20 }) as DOMRect;
    });
  }

  it("makes rows draggable but not their links", () => {
    show(group("g", 1, ["a"]));

    expect(row("a").getAttribute("draggable")).toBe("true");
    expect(link("a").getAttribute("draggable")).toBe("false");
    expect(link("a").getAttribute("aria-keyshortcuts")).toBe("Alt+ArrowUp Alt+ArrowDown");
  });

  it("finds the insert index from row midpoints", () => {
    expect(dropIndex([], 5)).toBe(0);
    expect(dropIndex([10, 30, 50], 0)).toBe(0);
    expect(dropIndex([10, 30, 50], 20)).toBe(1);
    expect(dropIndex([10, 30, 50], 60)).toBe(3);
  });

  it("moves a tab within its group on drop", () => {
    show(group("g", 1, ["a", "b", "c"]));
    layOut();

    drag(row("c"), "dragstart");
    const over = drag(row("a"), "dragover", 5);
    expect(over.defaultPrevented).toBe(true);
    expect(row("a").classList.contains("drop-before")).toBe(true);
    drag(row("a"), "drop", 5);

    expect(dispatch).toHaveBeenCalledWith({
      type: "moveTab",
      fromGroupId: "g",
      tabId: "c",
      toGroupId: "g",
      toIndex: 0,
    });
    expect(container.querySelector(".drop-before, .drop-end")).toBeNull();
  });

  it("moves a tab into another group on drop", () => {
    show(group("older", 1, ["a", "b"]), group("newer", 2, ["c"]));
    layOut(); // c at 0-20, then a and b

    drag(row("b"), "dragstart");
    drag(row("c"), "dragover", 15);
    expect(container.querySelector(".tabs")!.classList.contains("drop-end")).toBe(true);
    drag(row("c"), "drop", 15);

    expect(dispatch).toHaveBeenCalledWith({
      type: "moveTab",
      fromGroupId: "older",
      tabId: "b",
      toGroupId: "newer",
      toIndex: 1,
    });
  });

  it("dispatches nothing for a drop in place", () => {
    show(group("g", 1, ["a", "b"]));
    layOut();

    drag(row("a"), "dragstart");
    drag(row("b"), "drop", 5);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("ignores drops from outside the page", () => {
    show(group("g", 1, ["a", "b"]));
    layOut();

    drag(row("b"), "dragstart");
    drag(row("b"), "dragend");
    const over = drag(row("a"), "dragover", 5, ["text/uri-list"]);
    drag(row("a"), "drop", 5, ["text/uri-list"]);

    expect(over.defaultPrevented).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("moves the focused tab with Alt+Up and Alt+Down", () => {
    show(group("older", 1, ["c", "d"]), group("newer", 2, ["a", "b"]));
    const key = (tabId: string, key: string, init: KeyboardEventInit = { altKey: true }) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
      link(tabId).dispatchEvent(event);
      return event;
    };

    expect(key("b", "ArrowUp").defaultPrevented).toBe(true);
    key("c", "ArrowUp");
    key("a", "ArrowUp");
    key("a", "ArrowUp", { altKey: true, ctrlKey: true });
    key("a", "ArrowUp", {});

    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      { type: "moveTab", fromGroupId: "newer", tabId: "b", toGroupId: "newer", toIndex: 0 },
      { type: "moveTab", fromGroupId: "older", tabId: "c", toGroupId: "newer", toIndex: 2 },
    ]);
  });

  it("keeps focus on the same tab across a re-render", () => {
    document.body.append(container);
    show(group("g", 1, ["a", "b", "c"]));
    link("b").focus();

    show(group("g", 1, ["b", "a", "c"]));

    expect(document.activeElement).toBe(link("b"));
    container.remove();
  });
});
