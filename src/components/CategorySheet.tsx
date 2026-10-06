import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { db } from "../db/db";
import { useToast } from "./ui/Toast";
import type { Category, TxType } from "../types";

const ICONS = [
  // خوراکی
  "☕", "🍔", "🍕", "🍰", "🍽️", "🍩", "🥗", "🥤", "🍎", "🍞",
  // حمل و نقل
  "🚗", "🚕", "🚌", "🚇", "✈️", "🚲", "⛽", "🛵", "🚂", "🅿️",
  // خرید
  "🛒", "🛍️", "💳", "💎", "🎀", "👗", "👕", "👟", "👜", "💄",
  // خانه و قبض
  "🏠", "💡", "💧", "🔥", "📱", "🌐", "📺", "🧹", "🛋️", "🔌",
  // سلامت
  "💊", "🏥", "🩺", "💉", "🦷", "🩹", "🧘", "💪", "🏋️", "🥗",
  // سرگرمی
  "🎬", "🎮", "🎵", "📚", "🎨", "🎭", "🎤", "🎧", "📷", "🎪",
  // مالی
  "💰", "💵", "🏦", "📈", "📉", "💼", "🪙", "💸", "🧾", "🏧",
  // شخصی
  "🎁", "🎂", "💝", "✈️", "🏖️", "🗺️", "🎯", "⭐", "🌟", "🎓",
  // کسب و کار
  "💻", "📊", "📞", "✉️", "🗂️", "📁", "🖥️", "⌨️", "🖱️", "🔧",
  // متفرقه
  "✨", "❓", "🔖", "🏷️", "📌", "🎈", "🌈", "🔮", "⚡", "🔥",
];

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#78716C", "#64748B", "#8B92A4",
];

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: number | null;
  defaultType?: TxType;
};

export function CategorySheet({
  open,
  onClose,
  editingId,
  defaultType = "expense",
}: Props) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState("#10B981");
  const [type, setType] = useState<TxType>(defaultType);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"icon" | "color">("icon");

  const isEdit = editingId != null;

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setLoading(true);
      (async () => {
        const cat = await db.categories.get(editingId!);
        if (cat) {
          setName(cat.name);
          setIcon(cat.icon);
          setColor(cat.color);
          setType(cat.type);
        }
        setLoading(false);
      })();
    } else {
      setName("");
      setIcon("✨");
      setColor("#10B981");
      setType(defaultType);
      setTab("icon");
    }
  }, [open, editingId, isEdit, defaultType]);

  const canSubmit = name.trim().length >= 2;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      // چک تکرار نام در همون تایپ
      const existing = await db.categories
        .where("type")
        .equals(type)
        .toArray();
      const duplicate = existing.find(
        (c) =>
          c.name.trim() === name.trim() &&
          (isEdit ? c.id !== editingId : true)
      );
      if (duplicate) {
        toast("این نام قبلاً وجود داره", "error");
        setSaving(false);
        return;
      }

      if (isEdit) {
        await db.categories.update(editingId!, {
          name: name.trim(),
          icon,
          color,
          type,
        });
        toast("دسته ویرایش شد ✓");
      } else {
        await db.categories.add({
          name: name.trim(),
          icon,
          color,
          type,
        });
        toast("دسته اضافه شد ✓");
      }
      onClose();
    } catch {
      toast("خطا در ذخیره", "error");
    } finally {
      setSaving(false);
    }
  }

  const isIncome = type === "income";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="fixed bottom-0 inset-x-0 z-[101] max-w-md mx-auto
                       bg-bg-card rounded-t-3xl border-t border-x border-bg-border
                       pb-[calc(env(safe-area-inset-bottom)+100px)]
                       max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold">
                {isEdit ? "ویرایش دسته" : "دسته جدید"}
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-hover flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{
                    borderColor: "var(--color-primary)",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
                {/* تب نوع */}
                <div className="flex gap-2 p-1 rounded-2xl bg-bg-hover border border-bg-border">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    disabled={isEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                    style={{
                      background:
                        type === "expense"
                          ? "linear-gradient(180deg, #F87171, #EF4444)"
                          : "transparent",
                      color:
                        type === "expense" ? "#fff" : "var(--color-text-muted)",
                    }}
                  >
                    <ArrowDownRight size={16} strokeWidth={2.5} />
                    خرج
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    disabled={isEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                    style={{
                      background:
                        type === "income"
                          ? "linear-gradient(180deg, #34D399, #10B981)"
                          : "transparent",
                      color:
                        type === "income" ? "#fff" : "var(--color-text-muted)",
                    }}
                  >
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                    درآمد
                  </button>
                </div>

                {/* پیش‌نمایش */}
                <div className="flex justify-center">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all"
                    style={{
                      background: color + "22",
                      border: `2px solid ${color}`,
                      boxShadow: `0 8px 32px ${color}40`,
                    }}
                  >
                    {icon}
                  </div>
                </div>

                {/* نام */}
                <div>
                  <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                    نام دسته
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً قهوه، بنزین، حقوق..."
                    className="input"
                    maxLength={20}
                  />
                </div>

                {/* تب انتخاب آیکون/رنگ */}
                <div>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setTab("icon")}
                      className="flex-1 py-2 rounded-xl text-[12px] font-bold transition-all"
                      style={{
                        background:
                          tab === "icon"
                            ? "var(--color-primary-soft)"
                            : "var(--color-bg-hover)",
                        color:
                          tab === "icon"
                            ? "var(--color-primary)"
                            : "var(--color-text-muted)",
                        border: `1px solid ${tab === "icon" ? "var(--color-primary)" : "var(--color-bg-border)"}`,
                      }}
                    >
                      🎨 آیکون
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("color")}
                      className="flex-1 py-2 rounded-xl text-[12px] font-bold transition-all"
                      style={{
                        background:
                          tab === "color"
                            ? "var(--color-primary-soft)"
                            : "var(--color-bg-hover)",
                        color:
                          tab === "color"
                            ? "var(--color-primary)"
                            : "var(--color-text-muted)",
                        border: `1px solid ${tab === "color" ? "var(--color-primary)" : "var(--color-bg-border)"}`,
                      }}
                    >
                      🎯 رنگ
                    </button>
                  </div>

                  {tab === "icon" ? (
                    <div className="grid grid-cols-8 gap-1.5 max-h-64 overflow-y-auto p-1">
                      {ICONS.map((ic) => {
                        const active = ic === icon;
                        return (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all active:scale-90"
                            style={{
                              background: active ? color + "25" : "var(--color-bg-hover)",
                              border: active
                                ? `2px solid ${color}`
                                : "1px solid transparent",
                            }}
                          >
                            {ic}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2.5 p-1">
                      {COLORS.map((c) => {
                        const active = c === color;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className="aspect-square rounded-2xl transition-all active:scale-90 flex items-center justify-center"
                            style={{
                              background: c,
                              border: active
                                ? "3px solid var(--color-text)"
                                : "3px solid transparent",
                              boxShadow: active
                                ? `0 0 20px ${c}`
                                : `0 2px 8px ${c}40`,
                            }}
                          >
                            {active && (
                              <Check
                                size={20}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || saving}
                  className="w-full py-4 text-base font-bold rounded-2xl text-white disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{
                    background: isIncome
                      ? "linear-gradient(180deg, #34D399, #10B981)"
                      : "linear-gradient(180deg, #F87171, #EF4444)",
                    boxShadow: canSubmit
                      ? `0 8px 24px ${isIncome ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`
                      : "none",
                  }}
                >
                  <Check size={20} />
                  {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن دسته"}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
