import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
export type ColorScheme = "emerald" | "royal" | "ocean" | "amber" | "rose";

const THEME_KEY = "kharjban-theme";
const COLOR_KEY = "kharjban-color";

export interface ColorPalette {
  key: ColorScheme;
  name: string;
  primary: string;
  light: string;
  gradient: [string, string, string];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    key: "emerald",
    name: "زمردی",
    primary: "#10B981",
    light: "#6EE7B7",
    gradient: ["#6EE7B7", "#10B981", "#047857"],
  },
  {
    key: "royal",
    name: "سلطنتی",
    primary: "#8B5CF6",
    light: "#C4B5FD",
    gradient: ["#C4B5FD", "#8B5CF6", "#5B21B6"],
  },
  {
    key: "ocean",
    name: "اقیانوسی",
    primary: "#0EA5E9",
    light: "#7DD3FC",
    gradient: ["#7DD3FC", "#0EA5E9", "#075985"],
  },
  {
    key: "amber",
    name: "کهربایی",
    primary: "#F59E0B",
    light: "#FCD34D",
    gradient: ["#FCD34D", "#F59E0B", "#92400E"],
  },
  {
    key: "rose",
    name: "رز",
    primary: "#F43F5E",
    light: "#FDA4AF",
    gradient: ["#FDA4AF", "#F43F5E", "#9F1239"],
  },
];

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "dark";
}

function getInitialColor(): ColorScheme {
  if (typeof window === "undefined") return "emerald";
  try {
    const v = localStorage.getItem(COLOR_KEY);
    if (v === "emerald" || v === "royal" || v === "ocean" || v === "amber" || v === "rose")
      return v;
  } catch {}
  return "emerald";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [color, setColor] = useState<ColorScheme>(getInitialColor);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color", color);
    try { localStorage.setItem(COLOR_KEY, color); } catch {}
  }, [color]);

  function toggleTheme() {
    setTheme((p) => (p === "dark" ? "light" : "dark"));
  }

  const palette = COLOR_PALETTES.find((p) => p.key === color) ?? COLOR_PALETTES[0];

  return {
    theme,
    color,
    palette,
    toggleTheme,
    setTheme,
    setColor,
  };
}
