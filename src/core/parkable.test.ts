import { describe, expect, it } from "vitest";
import { isParkable } from "./parkable";

const LIST = "chrome-extension://abc/list.html";
const tab = (url: string | undefined, pinned = false) => ({ url, pinned });

describe("isParkable", () => {
  it("parks ordinary web pages", () => {
    expect(isParkable(tab("https://example.com/"), LIST)).toBe(true);
    expect(isParkable(tab("http://localhost:3000/a"), LIST)).toBe(true);
    expect(isParkable(tab("file:///home/me/notes.txt"), LIST)).toBe(true);
  });

  it("skips pinned tabs", () => {
    expect(isParkable(tab("https://example.com/", true), LIST)).toBe(false);
  });

  it.each([
    "chrome://settings/",
    "chrome://newtab/",
    "chrome-extension://other/page.html",
    "about:blank",
    "devtools://devtools/bundled/inspector.html",
  ])("skips internal page %s", (url) => {
    expect(isParkable(tab(url), LIST)).toBe(false);
  });

  it("skips the list page, with or without a hash", () => {
    expect(isParkable(tab(LIST), LIST)).toBe(false);
    expect(isParkable(tab(`${LIST}#x`), LIST)).toBe(false);
  });

  it("skips tabs without a URL", () => {
    expect(isParkable(tab(undefined), LIST)).toBe(false);
    expect(isParkable(tab(""), LIST)).toBe(false);
  });
});
