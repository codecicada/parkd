import { loadState } from "../core/state";
import type { ParkdState } from "../core/types";

export const STORAGE_KEY = "parkd";

export async function readState(): Promise<ParkdState> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return loadState(stored[STORAGE_KEY]);
}

export async function writeState(state: ParkdState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Runs mutations one at a time, so two read-modify-write cycles never interleave.
 * A failed mutation rejects its own caller and does not block the next one.
 */
export function serialize<T>(mutation: () => Promise<T>): Promise<T> {
  const run = queue.then(mutation);
  queue = run.catch(() => undefined);
  return run;
}
