import { themes } from "./color.js";

function toKebab(str) {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

export function applyTheme(themeName) {
  const tokens = themes[themeName];
  if (!tokens) return;

  const root = document.documentElement;
  root.setAttribute("data-theme", themeName);

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--${toKebab(key)}`, value);
  });
}