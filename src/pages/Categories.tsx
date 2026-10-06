import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { db } from "../db/db";
import { useToast } from "../components/ui/Toast";
import { CategorySheet } from "../components/CategorySheet";
import type { TxType } from "../types";

export function Categories({ onClose }: { onClose: () => void }) {
  const categories = useCategories();
  const toast = useToast();
  const [filter, setFilter] = useState<TxType>("expense");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    name: string;
    count: number;
  } | null>(null);

  const filtered = categories.filter((c) => c.type === filter);

  function openAdd() {
    setEditingId(null);
    setSheetOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setSheetOpen(true);
  }

  async function tryDelete(id: number, name: string) {
    const count = await db.expenses.where("categoryId").equals(id).count();
    if (count > 0) {
      setConfirmDelete({ id, name, count });
    } else {
      await doDelete(id);
    }
  }

  async function doDelete(id: number) {
    try {
      await db.categories.delete(id);
      toast("دسته حذف شد");
    } catch {
      toast("خطا در حذف", "error");
    }
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function deleteWithTransactions(id: number) {
    try {
      await db.transaction("rw", db.categories, db.expenses, async () => {
        await db.expenses.where("categoryId").equals(id).delete();
        await db.categories.delete(id);
      });
      toast("دسته و تراکنش‌هاش حذف شد");
    } catch {
      toast("خطا در حذف", "error");
    }
    setConfirmDelete(null);
  }

  return (
    <div className="pb-32">
      {/* هدر */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-bg-border)",
            }}
            aria-label="بازگشت"
          >
            <ArrowRight size={18} className="text-primary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary">دسته‌بندی‌ها</h1>
            <p className="text-[11px] text-text-muted mt-0.5">
              {filtered.length} دسته
            </p>
          </div>
        </div>
      </header>

      {/* فیلتر نوع */}
      <div className="px-5">
        <div className="flex gap-2 p-1 rounded-2xl bg-bg-card border border-bg-border">
          <button
            onClick={() => setFilter("expense")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background:
                filter === "expense"
                  ? "linear-gradient(180deg, #F87171, #EF4444)"
                  : "transparent",
              color: filter === "expense" ? "#fff" : "var(--color-text-muted)",
            }}
          >
            خرج
          </button>
          <button
            onClick={() => setFilter("income")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background:
                filter === "income"
                  ? "linear-gradient(180deg, #34D399, #10B981)"
                  : "transparent",
              color: filter === "income" ? "#fff" : "var(--color-text-muted)",
            }}
          >
            درآمد
          </button>
        </div>
      </div>

      {/* لیست دسته‌ها */}
      <div className="px-5 mt-5 space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-12"
            >
              <p className="text-4xl mb-3">📁</p>
              <p className="text-text-muted text-sm">
                هنوز دسته‌ای نداری
              </p>
            </motion.div>
          ) : (
            filtered.map((c, i) => {
              const isDeleting = deleting === c.id;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{
                    delay: isDeleting ? 0 : i * 0.03,
                    duration: 0.3,
                  }}
                  className="card flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: c.color + "22",
                      border: `1px solid ${c.color}40`,
                      boxShadow: `0 4px 12px ${c.color}25`,
                    }}
                  >
                    {c.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-[15px]">
                      {c.name}
                    </p>
                    <p
                      className="text-[10px] mt-0.5 tabular-nums"
                      style={{ color: c.color }}
                    >
                      {c.color.toUpperCase()}
                    </p>
                  </div>

                  {!isDeleting ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c.id!)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
                        style={{
                          background: "rgba(var(--primary-rgb),0.10)",
                          border: "1px solid rgba(var(--primary-rgb),0.20)",
                        }}
                        aria-label="ویرایش"
                      >
                        <Pencil size={14} className="text-primary" />
                      </button>
                      <button
                        onClick={() => setDeleting(c.id!)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
                        style={{
                          background: "rgba(248,113,113,0.10)",
                          border: "1px solid rgba(248,113,113,0.15)",
                        }}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} className="text-danger" />
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={() => setDeleting(null)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-bg-hover border border-bg-border"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={() => tryDelete(c.id!, c.name)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
                        style={{
                          background:
                            "linear-gradient(180deg, #F87171, #EF4444)",
                        }}
                      >
                        حذف
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* دکمه شناور */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={openAdd}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40
                   rounded-2xl px-7 py-4 flex items-center gap-2.5 font-bold text-[15px] text-white tracking-tight"
        style={{
          background: "linear-gradient(180deg, #34D399 0%, #10B981 50%, #059669 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.3) inset, 0 16px 48px rgba(16,185,129,0.5), 0 4px 12px rgba(16,185,129,0.35)",
          textShadow: "0 1px 0 rgba(0,0,0,0.15)",
        }}
      >
        <Plus size={20} strokeWidth={2.8} /> دسته جدید
      </motion.button>

      {/* شیت افزودن/ویرایش */}
      <CategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        editingId={editingId}
        defaultType={filter}
      />

      {/* هشدار حذف با تراکنش */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[201] max-w-sm mx-auto
                         bg-bg-card rounded-3xl border border-bg-border p-6"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            >
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "rgba(248,113,113,0.15)",
                    border: "1px solid rgba(248,113,113,0.3)",
                  }}
                >
                  <AlertTriangle size={28} className="text-danger" />
                </div>
              </div>

              <h3 className="text-center text-lg font-bold mb-2">
                حذف «{confirmDelete.name}»؟
              </h3>

              <p className="text-center text-sm text-text-muted leading-6 mb-5">
                این دسته <b style={{ color: "#F87171" }}>{confirmDelete.count} تراکنش</b> داره.
                <br />
                اگه حذفش کنی، همه تراکنش‌هاش هم پاک می‌شن.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="btn-ghost flex-1 py-3 text-sm"
                >
                  انصراف
                </button>
                <button
                  onClick={() => deleteWithTransactions(confirmDelete.id)}
                  className="flex-1 py-3 text-sm rounded-2xl font-bold text-white"
                  style={{
                    background: "linear-gradient(180deg, #F87171, #EF4444)",
                  }}
                >
                  بله، حذف کن
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
