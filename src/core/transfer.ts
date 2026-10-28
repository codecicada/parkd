import { sortedGroups } from "./groups";
import type { ParkdState } from "./types";

/** One imported tab, before it gets an ID. */
export interface ImportedTab {
  url: string;
  title: string;
}

export interface ParsedImport {
  /** One entry per group, each with at least one tab. */
  blocks: ImportedTab[][];
  /** Non-blank lines that were not imported. */
  skipped: number;
}

const SEPARATOR = " | ";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "file:", "ftp:"]);

const oneLine = (text: string) => text.replace(/\s*[\r\n]+\s*/g, " ").trim();

/** Every parked tab as `URL | title` lines, groups newest first, a blank line between groups. */
export function formatExport(state: ParkdState): string {
  return sortedGroups(state)
    .map((group) => group.tabs.map((tab) => `${tab.url}${SEPARATOR}${oneLine(tab.title)}`).join("\n"))
    .join("\n\n");
}

function parseLine(line: string): ImportedTab | undefined {
  const at = line.indexOf(SEPARATOR);
  const rawUrl = (at === -1 ? line : line.slice(0, at)).trim();
  const title = at === -1 ? "" : line.slice(at + SEPARATOR.length).trim();
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return undefined;
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return undefined;
  return { url: url.href, title: title || url.href };
}

/** Reads `URL | title` lines; a blank line ends a group. Lines that do not parse are counted, never guessed. */
export function parseImport(text: string): ParsedImport {
  const blocks: ImportedTab[][] = [];
  let current: ImportedTab[] = [];
  let skipped = 0;

  const endBlock = () => {
    if (current.length > 0) blocks.push(current);
    current = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") {
      endBlock();
      continue;
    }
    const tab = parseLine(line);
    if (tab) current.push(tab);
    else skipped++;
  }
  endBlock();

  return { blocks, skipped };
}
