import { db } from "./db";
import type { Category } from "../types";

export const MISC_CATEGORY_NAMES = ["متفرقه", "دیگر"];

const DEFAULTS: Category[] = [
  { name: "کافه و رستوران", icon: "☕", color: "#F97316", type: "expense" },
  { name: "قرض و بدهی",     icon: "🏦", color: "#EF4444", type: "expense" },
  { name: "پوشاک",          icon: "👕", color: "#A855F7", type: "expense" },
  { name: "وسیله نقلیه",    icon: "🚗", color: "#3B82F6", type: "expense" },
  { name: "متفرقه",         icon: "✨", color: "#8B92A4", type: "expense" },

  { name: "حقوق",           icon: "💼", color: "#10B981", type: "income" },
  { name: "پروژه",          icon: "💻", color: "#06B6D4", type: "income" },
  { name: "هدیه",           icon: "🎁", color: "#F59E0B", type: "income" },
  { name: "سرمایه‌گذاری",   icon: "📈", color: "#8B5CF6", type: "income" },
  { name: "دیگر",           icon: "✨", color: "#8B92A4", type: "income" },
];

let seeding = false;

export async function seedIfEmpty() {
  if (seeding) return;
  seeding = true;
  try {
    const existing = await db.categories.toArray();
    const keys = new Set(existing.map((c) => `${c.type}:${c.name}`));
    const missing = DEFAULTS.filter((d) => !keys.has(`${d.type}:${d.name}`));
    if (missing.length > 0) {
      await db.categories.bulkAdd(missing);
    }
  } finally {
    seeding = false;
  }
}
