import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import { db } from "../../db/db";
import { MISC_CATEGORY_NAMES } from "../../db/seed";
import { formatMoney } from "../../lib/format";
import { useToast } from "../ui/Toast";
import type { TxType } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  editingId?: number | null;
};

export function ExpenseSheet({ open, onClose, editingId }: Props) {
  const categories = useCategories();
  const toast = useToast();
  const [txType, setTxType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEdit = editingId != null;

  const filteredCats = categories.filter((c) => c.type === txType);

  // باز شدن: یا لود برای ویرایش یا پاک کردن فرم
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setLoading(true);
      (async () => {
        const item = await db.expenses.get(editingId!);
        if (item) {
          setTxType(item.type);
          setAmount(String(item.amount));
          setCategoryId(item.categoryId);
          setNote(item.note ?? "");
        }
        setLoading(false);
      })();
    } else {
      setAmount("");
      setNote("");
      setTxType("expense");
    }
  }, [open, editingId, isEdit]);

  // اگه تایپ عوض شد و دسته با تایپ جدید نخوند، اولین دسته
  useEffect(() => {
    if (!open || loading) return;
    const current = categories.find((c) => c.id === categoryId);
    if (current && current.type === txType) return;
    const first = categories.find((c) => c.type === txType);
    setCategoryId(first?.id ?? null);
    if (!isEdit) setNote("");
  }, [txType, categories, open, loading, categoryId, isEdit]);

  const selectedCat = categories.find((c) => c.id === categoryId);
  const isMisc = selectedCat && MISC_CATEGORY_NAMES.includes(selectedCat.name);

  const amountNum = Number(amount.replace(/\D/g, "")) || 0;
  const isNoteValid = !isMisc || note.trim().length >= 2;
  const canSubmit = amountNum > 0 && categoryId !== null && isNoteValid;

  const isIncome = txType === "income";
  const themeColor = isIncome ? "#10B981" : "#EF4444";

  async function handleSubmit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      if (isEdit) {
        await db.expenses.update(editingId!, {
          amount: amountNum,
          note: note.trim() || undefined,
          categoryId: categoryId!,
          type: txType,
        });
        toast("تراکنش ویرایش شد ✓");
      } else {
        await db.expenses.add({
          amount: amountNum,
          note: note.trim() || undefined,
          categoryId: categoryId!,
          type: txType,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        toast(isIncome ? "درآمد ثبت شد ✓" : "خرج ثبت شد ✓");
      }
      onClose();
    } catch {
      toast("خطا در ذخیره", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleAmountChange(v: string) {
    setAmount(v.replace(/\D/g, ""));
  }

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
                       pb-[calc(env(safe-area-inset-bottom)+100px)] max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold">
                {isEdit
                  ? `ویرایش ${isIncome ? "درآمد" : "خرج"}`
                  : `ثبت ${isIncome ? "درآمد" : "خرج"}`}
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
              <div className="px-5 pb-6 space-y-5">
                {/* تب نوع */}
                <div className="flex gap-2 p-1 rounded-2xl bg-bg-hover border border-bg-border">
                  <button
                    onClick={() => setTxType("expense")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background:
                        txType === "expense"
                          ? "linear-gradient(180deg, #F87171, #EF4444)"
                          : "transparent",
                      color:
                        txType === "expense" ? "#fff" : "var(--color-text-muted)",
                      boxShadow:
                        txType === "expense"
                          ? "0 4px 12px rgba(239,68,68,0.3)"
                          : "none",
                    }}
                  >
                    <ArrowDownRight size={16} strokeWidth={2.5} />
                    خرج
                  </button>
                  <button
                    onClick={() => setTxType("income")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background:
                        txType === "income"
                          ? "linear-gradient(180deg, #34D399, #10B981)"
                          : "transparent",
                      color:
                        txType === "income" ? "#fff" : "var(--color-text-muted)",
                      boxShadow:
                        txType === "income"
                          ? "0 4px 12px rgba(16,185,129,0.3)"
                          : "none",
                    }}
                  >
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                    درآمد
                  </button>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-2 block">
                    مبلغ (تومان)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString("en-US") : ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="۰"
                    className="input text-3xl font-extrabold text-center tabular-nums !py-5"
                    style={{ color: themeColor }}
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-2 block">
                    دسته‌بندی
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {filteredCats.map((c) => {
                      const active = c.id === categoryId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCategoryId(c.id!)}
                          className="flex flex-col items-center gap-1 py-2 rounded-2xl transition-all active:scale-95"
                          style={{
                            background: active ? c.color + "22" : "transparent",
                            border: active
                              ? `1.5px solid ${c.color}`
                              : "1.5px solid transparent",
                          }}
                        >
                          <span className="text-2xl">{c.icon}</span>
                          <span
                            className="text-[10px] font-medium leading-tight text-center"
                            style={{ color: active ? c.color : "#8B92A4" }}
                          >
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-2 block">
                    توضیح{" "}
                    {isMisc ? (
                      <span style={{ color: themeColor }}>(اجباری)</span>
                    ) : (
                      <span className="text-text-dim">(اختیاری)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={isMisc ? "موضوع خودت رو بنویس..." : "اختیاری"}
                    className="input"
                    maxLength={40}
                  />
                  {isMisc && note.trim().length < 2 && (
                    <p className="text-xs mt-1.5" style={{ color: themeColor }}>
                      برای «{selectedCat?.name}» باید حداقل ۲ حرف توضیح بنویسی
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || saving}
                  className="w-full py-4 text-base font-bold rounded-2xl text-white disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{
                    background: canSubmit
                      ? isIncome
                        ? "linear-gradient(180deg, #34D399, #10B981)"
                        : "linear-gradient(180deg, #F87171, #EF4444)"
                      : "var(--color-bg-hover)",
                    boxShadow: canSubmit
                      ? isIncome
                        ? "0 8px 24px rgba(16,185,129,0.4)"
                        : "0 8px 24px rgba(239,68,68,0.4)"
                      : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Check size={20} />
                  {saving
                    ? "در حال ذخیره..."
                    : isEdit
                    ? "ذخیره تغییرات"
                    : `ثبت ${isIncome ? "درآمد" : "خرج"}`}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
