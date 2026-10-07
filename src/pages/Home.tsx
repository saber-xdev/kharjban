import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Sparkles, ArrowUpRight, ArrowDownRight, Scale, Pencil,
} from "lucide-react";
import { useExpenses, useMonthlyTotals } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../components/AuthGate";
import { PageHeader } from "../components/layout/PageHeader";
import { formatMoney, relativeDay, toFa } from "../lib/format";
import { CategoryPie } from "../components/charts/CategoryPie";
import { db } from "../db/db";
import { useToast } from "../components/ui/Toast";

export function Home({
  onAdd,
  onEdit,
}: {
  onAdd: () => void;
  onEdit: (id: number) => void;
}) {
  const { user } = useAuth();
  const expenses = useExpenses();
  const totals = useMonthlyTotals();
  const categories = useCategories();
  const toast = useToast();
  const recent = expenses.slice(0, 5);
  const catMap = new Map(categories.map((c) => [c.id!, c]));
  const [deleting, setDeleting] = useState<number | null>(null);

  const expenseList = expenses.filter((e) => e.type !== "income");

  const todayTotals = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const t = new Date();
      return d.toDateString() === t.toDateString();
    })
    .reduce(
      (acc, e) => {
        if (e.type === "income") acc.income += e.amount;
        else acc.expense += e.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );

  async function handleDelete(id: number) {
    try {
      await db.expenses.delete(id);
      toast("حذف شد");
    } catch {
      toast("خطا در حذف", "error");
    }
    setDeleting(null);
  }

  return (
    <div className="pb-36 relative">
      <PageHeader />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, var(--color-primary-deep) 40%, transparent 70%)",
        }}
      />

      <header className="px-6 pt-10 pb-5 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-muted text-[13px] font-medium tracking-tight">
              سلام {user?.firstName || ""} 👋
            </p>
            <h1
              className="text-[28px] font-extrabold mt-1.5 leading-[1.35] pb-1 tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-bright) 0%, var(--color-primary) 50%, var(--color-primary-deep) 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shine 5s ease-in-out infinite",
              }}
            >
              خرج‌بان
            </h1>
          </div>

          <div
            className="pill mt-2"
            style={{
              background: "var(--color-primary-soft)",
              color: "var(--color-primary-bright)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-primary)",
                boxShadow: "0 0 6px var(--color-primary)",
                animation: "pulse-soft 2s ease-in-out infinite",
              }}
            />
            آنلاین
          </div>
        </div>
      </header>

      <div className="px-5 relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hero-card rounded-3xl overflow-hidden relative"
        >
          <div className="hero-grid absolute inset-0 pointer-events-none" />
          <div className="hero-glow absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[100px] pointer-events-none" />

          <div className="p-6 relative">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--color-primary-soft)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <Scale size={12} className="text-primary" />
              </div>
              <span
                className="text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: "var(--color-primary)", letterSpacing: "0.05em" }}
              >
                مانده این ماه
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <p
                className="text-[42px] font-extrabold tabular-nums leading-none tracking-tight"
                style={{ color: "var(--hero-text)" }}
              >
                {formatMoney(Math.abs(totals.balance))}
              </p>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--hero-text-muted)" }}
              >
                تومان
              </span>
            </div>

            <div
              className="mt-6 pt-5 grid grid-cols-2 gap-4"
              style={{ borderTop: "1px solid var(--hero-divider)" }}
            >
              <div>
                <div
                  className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase"
                  style={{ color: "var(--hero-text-muted)" }}
                >
                  <ArrowUpRight size={10} />
                  درآمد
                </div>
                <p
                  className="text-[15px] font-bold tabular-nums mt-1.5"
                  style={{ color: "#10B981" }}
                >
                  {formatMoney(totals.income)}
                </p>
              </div>
              <div
                className="pr-4"
                style={{ borderRight: "1px solid var(--hero-divider)" }}
              >
                <div
                  className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase"
                  style={{ color: "var(--hero-text-muted)" }}
                >
                  <ArrowDownRight size={10} />
                  خرج
                </div>
                <p
                  className="text-[15px] font-bold tabular-nums mt-1.5"
                  style={{ color: "#EF4444" }}
                >
                  {formatMoney(totals.expense)}
                </p>
              </div>
            </div>

            {(todayTotals.income > 0 || todayTotals.expense > 0) && (
              <div
                className="mt-4 pt-4 flex items-center justify-between text-[11px]"
                style={{
                  borderTop: "1px solid var(--hero-divider)",
                  color: "var(--hero-text-muted)",
                }}
              >
                <span>امروز</span>
                <div className="flex items-center gap-3 tabular-nums">
                  {todayTotals.income > 0 && (
                    <span style={{ color: "#10B981" }}>
                      +{formatMoney(todayTotals.income)}
                    </span>
                  )}
                  {todayTotals.expense > 0 && (
                    <span style={{ color: "#EF4444" }}>
                      −{formatMoney(todayTotals.expense)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {expenseList.length > 0 && (
        <section className="px-5 mt-7 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[13px] text-text-muted font-semibold flex items-center gap-2 tracking-tight">
              <Sparkles size={13} className="text-accent" />
              سهم خرج‌ها
            </h2>
          </div>
          <div className="card-glass p-5">
            <CategoryPie expenses={expenseList} categories={categories} />
          </div>
        </section>
      )}

      <section className="px-5 mt-7 relative">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[13px] text-text-muted font-semibold tracking-tight">
            آخرین تراکنش‌ها
          </h2>
          {expenses.length > 5 && (
            <span className="text-[11px] text-text-dim tabular-nums">
              {toFa(expenses.length)} مورد
            </span>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="card text-center py-14">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-4"
            >
              🪄
            </motion.div>
            <p className="text-text-muted text-[13px] leading-7 font-medium">
              هنوز چیزی ثبت نکردی
              <br />
              با دکمه پایین شروع کن
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {recent.map((e, i) => {
                const cat = catMap.get(e.categoryId);
                const isIncome = e.type === "income";
                const isMisc =
                  cat?.name === "متفرقه" || cat?.name === "دیگر";
                const isDeleting = deleting === e.id;

                const title = isMisc
                  ? e.note || cat?.name || "—"
                  : cat?.name ?? "—";

                const subtitle = isMisc
                  ? relativeDay(e.date)
                  : e.note
                  ? `${e.note} · ${relativeDay(e.date)}`
                  : relativeDay(e.date);

                return (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                    transition={{
                      delay: isDeleting ? 0 : i * 0.05,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="card flex items-center gap-3.5 px-4 py-3.5"
                  >
                    <div
                      className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-3xl opacity-20 pointer-events-none"
                      style={{ background: cat?.color ?? "#888" }}
                    />

                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 relative"
                      style={{
                        background: `linear-gradient(135deg, ${(cat?.color ?? "#888")}22, ${(cat?.color ?? "#888")}08)`,
                        border: `1px solid ${(cat?.color ?? "#888")}2A`,
                      }}
                    >
                      {cat?.icon ?? (isIncome ? "📈" : "💸")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[14.5px] tracking-tight">
                        {title}
                      </p>
                      <p className="text-[11px] text-text-muted mt-1 truncate">
                        {subtitle}
                      </p>
                    </div>

                    {!isDeleting ? (
                      <div className="flex items-center gap-2">
                        <p
                          className="font-bold tabular-nums text-[15px] tracking-tight"
                          style={{
                            color: isIncome ? "#10B981" : undefined,
                          }}
                        >
                          {isIncome ? "+" : "−"}
                          {formatMoney(e.amount)}
                        </p>
                        <button
                          onClick={() => onEdit(e.id!)}
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
                          style={{
                            background: "rgba(var(--primary-rgb),0.10)",
                            border: "1px solid rgba(var(--primary-rgb),0.20)",
                          }}
                          aria-label="ویرایش"
                        >
                          <Pencil size={13} className="text-primary" />
                        </button>
                        <button
                          onClick={() => setDeleting(e.id!)}
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
                          style={{
                            background: "rgba(248,113,113,0.10)",
                            border: "1px solid rgba(248,113,113,0.15)",
                          }}
                          aria-label="حذف"
                        >
                          <Trash2 size={13} className="text-danger" />
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
                          onClick={() => handleDelete(e.id!)}
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
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onAdd}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40
                   rounded-2xl px-7 py-4 flex items-center gap-2.5 font-bold text-[15px] text-white tracking-tight"
        style={{
          background:
            "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.3) inset, 0 16px 48px rgba(var(--primary-rgb),0.5), 0 4px 12px rgba(var(--primary-rgb),0.35)",
          textShadow: "0 1px 0 rgba(0,0,0,0.15)",
        }}
      >
        <Plus size={20} strokeWidth={2.8} /> ثبت
      </motion.button>
    </div>
  );
}
