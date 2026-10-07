import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { Card } from "../components/ui/Card";
import { formatMoney, relativeDay, dayKey } from "../lib/format";
import { db } from "../db/db";
import { useToast } from "../components/ui/Toast";
import { cn } from "../lib/utils";
import { PageHeader } from "../components/layout/PageHeader";
import type { TxType } from "../types";

type DateFilter = "today" | "week" | "month" | "all";
type TypeFilter = "all" | TxType;

const dateFilters: { key: DateFilter; label: string }[] = [
  { key: "today", label: "امروز" },
  { key: "week", label: "هفته" },
  { key: "month", label: "ماه" },
  { key: "all", label: "همه" },
];

const typeFilters: { key: TypeFilter; label: string; color: string }[] = [
  { key: "all", label: "همه", color: "var(--color-primary)" },
  { key: "expense", label: "خرج", color: "#EF4444" },
  { key: "income", label: "درآمد", color: "#10B981" },
];

export function List({ onEdit }: { onEdit: (id: number) => void }) {
  const expenses = useExpenses();
  const categories = useCategories();
  const toast = useToast();
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id!, c])),
    [categories]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    let start: Date | null = null;

    if (dateFilter === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === "week") {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else if (dateFilter === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return expenses.filter((e) => {
      if (start && new Date(e.date) < start) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      return true;
    });
  }, [expenses, dateFilter, typeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const k = dayKey(e.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const e of filtered) {
      if (e.type === "income") income += e.amount;
      else expense += e.amount;
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

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
    <div className="pb-32">
      <PageHeader />
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-primary">تراکنش‌ها</h1>
      </header>

      <div className="px-5">
        <div className="flex gap-2 p-1 rounded-2xl bg-bg-card border border-bg-border">
          {typeFilters.map((f) => {
            const active = f.key === typeFilter;
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                  active ? "text-white" : "text-text-muted"
                )}
                style={{
                  background: active ? f.color : "transparent",
                  boxShadow: active ? `0 4px 14px ${f.color}40` : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-3">
        <div className="flex gap-2 bg-bg-card p-1 rounded-2xl border border-bg-border">
          {dateFilters.map((f) => {
            const active = f.key === dateFilter;
            return (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
                  active ? "bg-primary text-white" : "text-text-muted"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-4">
        <Card className="!py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-text-muted mb-1">درآمد</p>
              <p
                className="text-sm font-bold tabular-nums"
                style={{ color: "#10B981" }}
              >
                {formatMoney(totals.income)}
              </p>
            </div>
            <div className="border-x border-bg-border">
              <p className="text-[10px] text-text-muted mb-1">خرج</p>
              <p
                className="text-sm font-bold tabular-nums"
                style={{ color: "#EF4444" }}
              >
                {formatMoney(totals.expense)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted mb-1">مانده</p>
              <p className="text-sm font-bold tabular-nums text-primary">
                {formatMoney(Math.abs(totals.balance))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-5 mt-5 space-y-5">
        {grouped.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-text-muted text-sm">در این بازه چیزی نیست</p>
          </Card>
        ) : (
          grouped.map(([day, items]) => {
            const dayTotals = items.reduce(
              (a, e) => {
                if (e.type === "income") a.income += e.amount;
                else a.expense += e.amount;
                return a;
              },
              { income: 0, expense: 0 }
            );
            return (
              <div key={day}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ background: "var(--color-primary)" }}
                    />
                    <span className="text-xs font-semibold text-text">
                      {relativeDay(items[0].date)}
                    </span>
                    <span className="text-[10px] text-text-dim tabular-nums">
                      ({items.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] tabular-nums">
                    {dayTotals.income > 0 && (
                      <span style={{ color: "#10B981" }}>
                        +{formatMoney(dayTotals.income)}
                      </span>
                    )}
                    {dayTotals.expense > 0 && (
                      <span style={{ color: "#EF4444" }}>
                        −{formatMoney(dayTotals.expense)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {items.map((e) => {
                      const cat = catMap.get(e.categoryId);
                      const isIncome = e.type === "income";
                      const isMisc =
                        cat?.name === "متفرقه" || cat?.name === "دیگر";
                      const isDeleting = deleting === e.id;

                      const title = isMisc
                        ? e.note || cat?.name || "—"
                        : cat?.name ?? "—";

                      const subtitle = isMisc ? null : e.note || null;

                      return (
                        <motion.div
                          key={e.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          className="card flex items-center gap-3 px-4 py-3"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{
                              background: (cat?.color ?? "#888") + "22",
                              border: `1px solid ${(cat?.color ?? "#888")}2A`,
                            }}
                          >
                            {cat?.icon ?? (isIncome ? "📈" : "💸")}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-[14px] tracking-tight">
                              {title}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5 truncate">
                              {subtitle ? `${subtitle} · ` : ""}
                              {relativeDay(e.date)}
                            </p>
                          </div>

                          {!isDeleting ? (
                            <>
                              <p
                                className="font-bold tabular-nums text-sm shrink-0"
                                style={{
                                  color: isIncome ? "#10B981" : undefined,
                                }}
                              >
                                {isIncome ? "+" : "−"}
                                {formatMoney(e.amount)}
                              </p>
                              <button
                                onClick={() => onEdit(e.id!)}
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(var(--primary-rgb),0.10)",
                                  border:
                                    "1px solid rgba(var(--primary-rgb),0.20)",
                                }}
                                aria-label="ویرایش"
                              >
                                <Pencil size={13} className="text-primary" />
                              </button>
                              <button
                                onClick={() => setDeleting(e.id!)}
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: "rgba(248,113,113,0.10)",
                                  border: "1px solid rgba(248,113,113,0.15)",
                                }}
                                aria-label="حذف"
                              >
                                <Trash2 size={13} className="text-danger" />
                              </button>
                            </>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <button
                                onClick={() => setDeleting(null)}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-bg-hover"
                              >
                                انصراف
                              </button>
                              <button
                                onClick={() => handleDelete(e.id!)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
