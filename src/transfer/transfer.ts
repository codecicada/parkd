import type { ImportReport } from "../chrome/actions";
import { readState, STORAGE_KEY } from "../chrome/store";
import { loadState } from "../core/state";
import { formatExport } from "../core/transfer";
import { reportText, showExport } from "./view";

const exportText = document.getElementById("export-text") as HTMLTextAreaElement;
const exportEmpty = document.getElementById("export-empty")!;
const copyButton = document.getElementById("copy") as HTMLButtonElement;
const copyStatus = document.getElementById("copy-status")!;
const importText = document.getElementById("import-text") as HTMLTextAreaElement;
const importButton = document.getElementById("import") as HTMLButtonElement;
const importStatus = document.getElementById("import-status")!;

const refresh = (raw: unknown) =>
  showExport(formatExport(loadState(raw)), exportText, exportEmpty, copyButton);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && STORAGE_KEY in changes) refresh(changes[STORAGE_KEY]?.newValue);
});
readState().then(refresh);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportText.value);
    copyStatus.textContent = "Copied.";
  } catch {
    exportText.select();
    copyStatus.textContent = "Press Ctrl+C (or ⌘C) to copy the selected text.";
  }
});

importButton.addEventListener("click", async () => {
  const text = importText.value;
  if (text.trim() === "") {
    importStatus.textContent = "Paste some lines first.";
    return;
  }
  importButton.disabled = true;
  try {
    // The background worker parses, stores and reports; it is the only writer.
    const reply = (await chrome.runtime.sendMessage({ type: "importText", text })) as
      | { ok: boolean; result?: ImportReport }
      | undefined;
    if (!reply?.ok || !reply.result) throw new Error("import failed");
    importStatus.textContent = reportText(reply.result);
    if (reply.result.tabs > 0) importText.value = "";
  } catch {
    importStatus.textContent = "Import failed. Nothing was stored.";
  } finally {
    importButton.disabled = false;
  }
});
