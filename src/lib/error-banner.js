// Shows failures on screen (red bar at the top; click it to dismiss) instead of
// leaving them hidden in the browser console.
let bar = null;
let lines = [];

export function showErrorBanner(message) {
  if (typeof document === "undefined" || !message) return;
  if (!lines.includes(message)) lines = [...lines.slice(-4), message];
  if (!bar) {
    bar = document.createElement("div");
    bar.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;background:#b91c1c;color:#fff;" +
      "font:13px/1.45 system-ui,sans-serif;padding:10px 14px;max-height:45vh;overflow:auto;" +
      "white-space:pre-wrap;word-break:break-word;cursor:pointer";
    bar.title = "Click to dismiss";
    bar.addEventListener("click", () => { bar.remove(); bar = null; lines = []; });
    document.body.appendChild(bar);
  }
  bar.textContent = lines.join("\n\n");
}

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    showErrorBanner(`Unexpected error: ${e.reason?.message || e.reason}`);
  });
  window.addEventListener("error", (e) => {
    if (String(e.message).includes("ResizeObserver")) return;
    showErrorBanner(`Script error: ${e.message}`);
  });
}
