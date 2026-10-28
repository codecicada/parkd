import { isAction, runAction } from "./chrome/actions";
import { parkWindow } from "./chrome/park";

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId === undefined) return;
  parkWindow(tab.windowId).catch((error) => console.error("parkd: park failed", error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const windowId = sender.tab?.windowId;
  if (sender.id !== chrome.runtime.id || windowId === undefined || !isAction(message)) {
    return false;
  }
  runAction(message, windowId).then(
    (result) => sendResponse({ ok: true, result }),
    (error) => {
      console.error("parkd: action failed", error);
      sendResponse({ ok: false });
    },
  );
  return true; // keeps the channel open for the async response
});
