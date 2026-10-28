import type { ImportReport } from "../chrome/actions";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The line shown after an import. */
export function reportText(report: ImportReport): string {
  const skipped = report.skipped > 0 ? `, skipped ${plural(report.skipped, "line")}` : "";
  if (report.tabs === 0) return `Nothing was imported${skipped}.`;
  return `Imported ${plural(report.tabs, "tab")} in ${plural(report.groups, "group")}${skipped}.`;
}

/** Fills the export area, or shows the empty note when nothing is parked. */
export function showExport(text: string, area: HTMLTextAreaElement, empty: HTMLElement, copy: HTMLButtonElement) {
  area.value = text;
  area.hidden = text === "";
  empty.hidden = text !== "";
  copy.disabled = text === "";
}
