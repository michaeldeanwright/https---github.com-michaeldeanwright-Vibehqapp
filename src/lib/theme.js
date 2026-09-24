export function savedTheme() {
  return localStorage.getItem("vibe_theme") || "system";
}

export function applyTheme(value) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", value === "dark" || (value === "system" && prefersDark));
}