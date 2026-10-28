// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { reportText, showExport } from "./view";

describe("reportText", () => {
  it("states tabs, groups and skipped lines", () => {
    expect(reportText({ tabs: 2, groups: 1, skipped: 3 })).toBe("Imported 2 tabs in 1 group, skipped 3 lines.");
  });

  it("leaves out skipped lines when there are none", () => {
    expect(reportText({ tabs: 1, groups: 1, skipped: 0 })).toBe("Imported 1 tab in 1 group.");
  });

  it("says nothing was imported when no line was valid", () => {
    expect(reportText({ tabs: 0, groups: 0, skipped: 2 })).toBe("Nothing was imported, skipped 2 lines.");
  });
});

describe("showExport", () => {
  const parts = () => ({
    area: document.createElement("textarea"),
    empty: document.createElement("p"),
    copy: document.createElement("button"),
  });

  it("fills the text area", () => {
    const { area, empty, copy } = parts();
    showExport("https://a.test/ | A", area, empty, copy);
    expect(area.value).toBe("https://a.test/ | A");
    expect(area.hidden).toBe(false);
    expect(empty.hidden).toBe(true);
    expect(copy.disabled).toBe(false);
  });

  it("shows the empty note when nothing is parked", () => {
    const { area, empty, copy } = parts();
    showExport("", area, empty, copy);
    expect(area.hidden).toBe(true);
    expect(empty.hidden).toBe(false);
    expect(copy.disabled).toBe(true);
  });
});
