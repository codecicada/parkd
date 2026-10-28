import { describe, expect, it } from "vitest";
import { formatExport, parseImport } from "./transfer";
import type { Group, ParkdState } from "./types";

const group = (id: string, createdAt: number, tabs: [string, string][]): Group => ({
  id,
  createdAt,
  tabs: tabs.map(([url, title], i) => ({ id: `${id}${i}`, url, title })),
});
const state = (...groups: Group[]): ParkdState => ({ version: 1, groups });

describe("formatExport", () => {
  it("writes groups newest first, tabs in saved order, a blank line between groups", () => {
    const text = formatExport(
      state(
        group("yesterday", 1000, [["https://a.test/", "A"]]),
        group("today", 2000, [
          ["https://b.test/", "B"],
          ["https://c.test/", "C"],
        ]),
      ),
    );
    expect(text).toBe("https://b.test/ | B\nhttps://c.test/ | C\n\nhttps://a.test/ | A");
  });

  it("keeps a tab on one line when its title has a line break", () => {
    expect(formatExport(state(group("g", 1, [["https://a.test/", "Two\r\nlines "]])))).toBe(
      "https://a.test/ | Two lines",
    );
  });

  it("is empty when nothing is parked", () => {
    expect(formatExport(state())).toBe("");
  });
});

describe("parseImport", () => {
  it("splits groups on blank lines", () => {
    const { blocks, skipped } = parseImport("https://a.test/ | A\nhttps://b.test/ | B\n\nhttps://c.test/ | C");
    expect(blocks.map((b) => b.map((t) => t.title))).toEqual([["A", "B"], ["C"]]);
    expect(skipped).toBe(0);
  });

  it("uses the URL as title when none is given", () => {
    expect(parseImport("https://a.test/").blocks).toEqual([[{ url: "https://a.test/", title: "https://a.test/" }]]);
  });

  it("splits on the first separator only", () => {
    expect(parseImport("https://a.test/ | A | B").blocks[0]?.[0]?.title).toBe("A | B");
  });

  it("treats several blank lines as one break and stores no empty group", () => {
    const { blocks } = parseImport("\n\nhttps://a.test/\n\n\n\nhttps://b.test/\n\n");
    expect(blocks).toHaveLength(2);
  });

  it("accepts CRLF line endings and surrounding whitespace", () => {
    const { blocks } = parseImport("  https://a.test/ | A  \r\nhttps://b.test/ | B\r\n\r\nhttps://c.test/");
    expect(blocks.map((b) => b.length)).toEqual([2, 1]);
    expect(blocks[0]?.[0]?.title).toBe("A");
  });

  it("imports only http, https, file and ftp lines and counts the rest", () => {
    const { blocks, skipped } = parseImport(
      ["https://a.test/", "javascript:alert(1)", "chrome://settings/", "not a url", "ftp://b.test/", "file:///tmp/x"].join(
        "\n",
      ),
    );
    expect(blocks[0]?.map((t) => t.url)).toEqual(["https://a.test/", "ftp://b.test/", "file:///tmp/x"]);
    expect(skipped).toBe(3);
  });

  it("stores no group for a block with no valid line", () => {
    const { blocks, skipped } = parseImport("https://a.test/\n\njavascript:void(0)\ndata:text/html,hi");
    expect(blocks).toHaveLength(1);
    expect(skipped).toBe(2);
  });
});

describe("round trip", () => {
  it("parses an export back into the same groups", () => {
    const original = state(
      group("old", 1000, [["https://a.test/x?q=1", "A | with bar"]]),
      group("new", 2000, [
        ["https://b.test/", "B"],
        ["file:///home/me/c.txt", "C"],
      ]),
    );
    const { blocks, skipped } = parseImport(formatExport(original));
    expect(skipped).toBe(0);
    expect(blocks).toEqual([
      [
        { url: "https://b.test/", title: "B" },
        { url: "file:///home/me/c.txt", title: "C" },
      ],
      [{ url: "https://a.test/x?q=1", title: "A | with bar" }],
    ]);
  });
});
