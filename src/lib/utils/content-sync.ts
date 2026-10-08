export function notifyContentChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("mekfidel-content-change"));
  try {
    localStorage.setItem("mekfidel-content-revision", String(Date.now()));
  } catch {
    /* Storage is optional. */
  }
}
