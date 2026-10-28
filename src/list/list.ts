import type { Action } from "../chrome/actions";
import { readState, STORAGE_KEY } from "../chrome/store";
import { loadState } from "../core/state";
import { render } from "./render";

const container = document.getElementById("groups")!;
const summary = document.getElementById("summary")!;
const restoreAll = document.getElementById("restore-all") as HTMLButtonElement;

// The background worker is the only writer; this page asks it to act.
const dispatch = (action: Action) => {
  chrome.runtime.sendMessage(action).catch((error) => console.error("parkd:", error));
};

restoreAll.addEventListener("click", () => dispatch({ type: "restoreAll" }));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && STORAGE_KEY in changes) {
    render(loadState(changes[STORAGE_KEY]?.newValue), container, summary, restoreAll, dispatch);
  }
});

readState().then((state) => render(state, container, summary, restoreAll, dispatch));
