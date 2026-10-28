export interface ParkedTab {
  id: string;
  url: string;
  title: string;
}

export interface Group {
  id: string;
  /** Epoch milliseconds of the save. */
  createdAt: number;
  tabs: ParkedTab[];
}

export interface ParkdState {
  version: 1;
  groups: Group[];
}

/** The subset of a browser tab the core needs. */
export interface TabInfo {
  url?: string;
  title?: string;
  pinned: boolean;
}

export const emptyState = (): ParkdState => ({ version: 1, groups: [] });
