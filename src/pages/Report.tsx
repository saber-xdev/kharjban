import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, Zap, BarChart3, Scale, ChevronDown, Search, X, Calendar,
  FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../components/AuthGate";
import { Card } from "../components/ui/Card";
import { CategoryPie } from "../components/charts/CategoryPie";
import { PDFReport } from "../components/PDFReport";
import { PDFRangePicker, type DateRange } from "../components/PDFRangePicker";
import { usePDFExport } from "../hooks/usePDFExport";
import { formatMoney, toFa, relativeDay, dayKey, formatJalaliFull } from "../lib/format";
import type { Category, Expense } from "../types";

export function Report() {
  const expenses = useExpenses();
  const categories = useCategories();
  const { user } = useAuth();

  // ---- جستجو ----
  const [searchOpen, setSearchOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ---- PDF ----
  const [pdfPickerOpen, setPdfPickerOpen] = useState(false);
  const [pdfRange, setPdfRange] = useState<DateRange | null>(null);
  const { pdfRef, generating, exportPDF } = usePDFExport();

  const pdfFiltered = useMemo(() => {
    if (!pdfRange) return [];
    const s = new Date(pdfRange.start);
    const e = new Date(pdfRange.end);
    return expenses.filter((ex) => {
      const d = new Date(ex.date);
      return d >= s && d <= e;
    });
  }, [expenses, pdfRange]);

  async function handlePDFPick(range: DateRange) {
    setPdfRange(range);
    setPdfPickerOpen(false);
    // منتظر موندن برای مانت شدن کامپوننت مخفی
    await new Promise((r) => setTimeout(r, 100));
    const filename = `khari-ban-${new Date().toISOString().slice(0, 10)}.pdf`;
    await exportPDF(expenses, categories, filename);
    setPdfRange(null);
  }

  const searchResults = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    if (s > e) return [];

    const filtered = expenses.filter((ex) => {
      const d = new Date(ex.date);
      return d >= s && d <= e;
    });

    const map = new Map<string, Expense[]>();
    for (const ex of filtered) {
      const k = dayKey(ex.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ex);
    }
    const grouped = [...map.entries()].sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    );

    let income = 0;
    let expense = 0;
    for (const ex of filtered) {
      if (ex.type === "income") income += ex.amount;
      else expense += ex.amount;
    }

    return { filtered, grouped, income, expense, balance: income - expense };
  }, [expenses, startDate, endDate]);

  const monthExpenses = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses.filter((e) => new Date(e.date) >= start);
  }, [expenses]);

  const stats = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    for (const e of monthExpenses) {
      if (e.type === "income") income += e.amount;
      else expense += e.amount;
    }
    const daysPassed = now.getDate();
    const dailyAvgExpense = expense / daysPassed;

    const expenseList = monthExpenses.filter((e) => e.type !== "income");
    const biggest = [...expenseList].sort((a, b) => b.amount - a.amount)[0];

    const catTotals = new Map<number, number>();
    for (const e of expenseList) {
      catTotals.set(e.categoryId, (catTotals.get(e.categoryId) ?? 0) + e.amount);
    }
    let topCatId: number | null = null;
    let topCatTotal = 0;
    for (const [id, val] of catTotals) {
      if (val > topCatTotal) {
        topCatTotal = val;
        topCatId = id;
      }
    }
    const topCat = categories.find((c) => c.id === topCatId);

    return {
      income,
      expense,
      balance: income - expense,
      dailyAvgExpense,
      biggest,
      topCat,
      topCatTotal,
    };
  }, [monthExpenses, categories]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = 30;
    const buckets: { day: string; expense: number; income: number; label: string }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      let inc = 0;
      let exp = 0;
      for (const e of expenses) {
        if (e.date.slice(0, 10) !== key) continue;
        if (e.type === "income") inc += e.amount;
        else exp += e.amount;
      }
      buckets.push({
        day: key,
        expense: exp,
        income: inc,
        label: toFa(d.getDate()),
      });
    }
    return buckets;
  }, [expenses]);

  const biggestTitle =
    stats.biggest &&
    (() => {
      const c = categories.find((x) => x.id === stats.biggest!.categoryId);
      if (c?.name === "متفرقه" && stats.biggest.note) return stats.biggest.note;
      return c?.name ?? "—";
    })();

  const hasData = monthExpenses.length > 0;
  const expenseList = monthExpenses.filter((e) => e.type !== "income");
  const catMap = new Map(categories.map((c) => [c.id!, c]));

  function clearSearch() {
    setStartDate("");
    setEndDate("");
  }

  function setQuickRange(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  }

  function setThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  }

  return (
    <div className="pb-32">
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">گزارش</h1>
          <p className="text-text-muted text-xs mt-1">خلاصه این ماه</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPdfPickerOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background:
                "linear-gradient(180deg, var(--color-primary-light), var(--color-primary))",
              border: "1px solid var(--color-bg-border)",
              boxShadow: "0 4px 16px rgba(var(--primary-rgb),0.35)",
            }}
            aria-label="گزارش PDF"
          >
            <FileDown size={18} className="text-white" />
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: searchOpen
                ? "linear-gradient(180deg, var(--color-primary-light), var(--color-primary))"
                : "var(--color-bg-card)",
              border: "1px solid var(--color-bg-border)",
              boxShadow: searchOpen
                ? "0 4px 16px rgba(var(--primary-rgb),0.35)"
                : "none",
            }}
          >
            {searchOpen ? (
              <X size={18} className="text-white" />
            ) : (
              <Search size={18} className="text-primary" />
            )}
          </button>
        </div>
      </header>

      {/* جستجو */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-2">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: "var(--color-primary-soft)",
                      border: "1px solid rgba(var(--primary-rgb),0.3)",
                    }}
                  >
                    <Calendar size={12} className="text-primary" />
                  </div>
                  <span className="text-[12px] font-bold">
                    جستجو در بازه تاریخ
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setQuickRange(7)}
                    className="py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
                    style={{
                      background: "var(--color-bg-hover)",
                      border: "1px solid var(--color-bg-border)",
                    }}
                  >
                    ۷ روز اخیر
                  </button>
                  <button
                    onClick={() => setQuickRange(30)}
                    className="py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
                    style={{
                      background: "var(--color-bg-hover)",
                      border: "1px solid var(--color-bg-border)",
                    }}
                  >
                    ۳۰ روز اخیر
                  </button>
                  <button
                    onClick={setThisMonth}
                    className="py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
                    style={{
                      background: "var(--color-bg-hover)",
                      border: "1px solid var(--color-bg-border)",
                    }}
                  >
                    این ماه
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted mb-1.5 block">
                      از تاریخ
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input !py-2.5 !px-3 text-xs tabular-nums"
                      style={{ colorScheme: "dark" }}
                    />
                    {startDate && (
                      <p className="text-[10px] text-text-dim mt-1 truncate">
                        {formatJalaliFull(new Date(startDate).toISOString())}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted mb-1.5 block">
                      تا تاریخ
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input !py-2.5 !px-3 text-xs tabular-nums"
                      style={{ colorScheme: "dark" }}
                    />
                    {endDate && (
                      <p className="text-[10px] text-text-dim mt-1 truncate">
                        {formatJalaliFull(new Date(endDate).toISOString())}
                      </p>
                    )}
                  </div>
                </div>

                {(startDate || endDate) && (
                  <button
                    onClick={clearSearch}
                    className="w-full mt-3 py-2 rounded-xl text-[11px] font-semibold"
                    style={{
                      background: "rgba(248,113,113,0.10)",
                      color: "#F87171",
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    پاک کردن
                  </button>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نتایج جستجو */}
      {searchResults && (
        <div className="px-5 mt-4">
          <Card
            className="!p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(var(--primary-rgb),0.10), rgba(var(--primary-rgb),0.02))",
              borderColor: "rgba(var(--primary-rgb),0.25)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-primary">
                نتایج جستجو
              </span>
              <span className="text-[10px] text-text-muted tabular-nums">
                {toFa(searchResults.filtered.length)} مورد
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-text-muted mb-1">درآمد</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "#10B981" }}>
                  {formatMoney(searchResults.income)}
                </p>
              </div>
              <div className="border-x border-bg-border">
                <p className="text-[10px] text-text-muted mb-1">خرج</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: "#EF4444" }}>
                  {formatMoney(searchResults.expense)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted mb-1">مانده</p>
                <p className="text-sm font-bold tabular-nums text-primary">
                  {formatMoney(Math.abs(searchResults.balance))}
                </p>
              </div>
            </div>
          </Card>

          {searchResults.grouped.length === 0 ? (
            <Card className="text-center py-8 mt-3">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-text-muted text-xs">در این بازه تراکنشی نیست</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-4">
              {searchResults.grouped.map(([day, items]) => {
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
                        <div className="w-1 h-1 rounded-full" style={{ background: "var(--color-primary)" }} />
                        <span className="text-[11px] font-semibold">{relativeDay(items[0].date)}</span>
                        <span className="text-[10px] text-text-dim tabular-nums">({toFa(items.length)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] tabular-nums">
                        {dayTotals.income > 0 && <span style={{ color: "#10B981" }}>+{formatMoney(dayTotals.income)}</span>}
                        {dayTotals.expense > 0 && <span style={{ color: "#EF4444" }}>−{formatMoney(dayTotals.expense)}</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {items.map((e) => {
                        const cat = catMap.get(e.categoryId);
                        const isIncome = e.type === "income";
                        const isMisc = cat?.name === "متفرقه" || cat?.name === "دیگر";
                        const title = isMisc ? e.note || cat?.name || "—" : cat?.name ?? "—";
                        return (
                          <div key={e.id} className="card flex items-center gap-3 px-4 py-3">
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
                              <p className="font-semibold truncate text-[14px]">{title}</p>
                              {!isMisc && e.note && (
                                <p className="text-[10px] text-text-muted mt-0.5 truncate">{e.note}</p>
                              )}
                            </div>
                            <p
                              className="font-bold tabular-nums text-sm shrink-0"
                              style={{ color: isIncome ? "#10B981" : undefined }}
                            >
                              {isIncome ? "+" : "−"}
                              {formatMoney(e.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* گزارش ماه */}
      {!hasData ? (
        <div className="px-5 mt-6">
          <Card className="text-center py-10">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-text-muted text-sm leading-7">
              هنوز داده‌ای برای گزارش نیست
              <br />
              چند تا تراکنش ثبت کن
            </p>
          </Card>
        </div>
      ) : (
        <>
          <div className="px-5 mt-4">
            <Card
              className="!p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(var(--primary-rgb),0.12), rgba(var(--primary-rgb),0.02))",
                borderColor: "rgba(var(--primary-rgb),0.2)",
              }}
            >
              <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                <Scale size={14} className="text-primary" />
                مانده این ماه
              </div>
              <p
                className="text-3xl font-extrabold tabular-nums"
                style={{ color: "var(--color-primary)" }}
              >
                {formatMoney(Math.abs(stats.balance))}
                <span className="text-sm font-medium text-text-muted mr-2">تومان</span>
              </p>
            </Card>
          </div>

          <div className="px-5 mt-3 grid grid-cols-2 gap-3">
            <StatCard icon={<TrendingUp size={16} />} label="درآمد" value={formatMoney(stats.income)} suffix="تومان" color="#10B981" />
            <StatCard icon={<TrendingDown size={16} />} label="خرج" value={formatMoney(stats.expense)} suffix="تومان" color="#EF4444" />
            <StatCard icon={<Zap size={16} />} label="بیشترین خرج" value={stats.biggest ? formatMoney(stats.biggest.amount) : "—"} suffix="تومان" hint={biggestTitle} />
            <StatCard icon={<BarChart3 size={16} />} label="پرمصرف‌ترین" value={stats.topCat ? formatMoney(stats.topCatTotal) : "—"} suffix="تومان" hint={stats.topCat ? `${stats.topCat.icon} ${stats.topCat.name}` : ""} />
          </div>

          <section className="px-5 mt-6">
            <h2 className="text-sm text-text-muted mb-3">روند ۳۰ روز اخیر</h2>
            <Card className="!pl-2 !pr-4 !py-5">
              <div className="h-44 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "var(--color-text-dim)", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis
                      tick={{ fill: "var(--color-text-dim)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? toFa((v / 1000000).toFixed(1)) + "M"
                          : v >= 1000
                          ? toFa(Math.round(v / 1000)) + "K"
                          : toFa(v)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-bg-card)",
                        border: "1px solid var(--color-bg-border)",
                        borderRadius: 12,
                        fontFamily: "Vazirmatn",
                        direction: "rtl",
                      }}
                      formatter={(v: number, name) => [formatMoney(v) + " تومان", name === "income" ? "درآمد" : "خرج"]}
                      labelFormatter={(l) => `روز ${l}`}
                    />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#EF4444" }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-5 mt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
                  درآمد
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
                  خرج
                </div>
              </div>
            </Card>
          </section>

          {expenseList.length > 0 && (
            <section className="px-5 mt-6">
              <h2 className="text-sm text-text-muted mb-3">سهم خرج‌ها</h2>
              <Card>
                <CategoryPie expenses={expenseList} categories={categories} />
                <div className="mt-5 space-y-2">
                  <CategoryLegend expenses={expenseList} categories={categories} />
                </div>
              </Card>
            </section>
          )}
        </>
      )}

      {/* انتخاب بازه PDF */}
      <PDFRangePicker
        open={pdfPickerOpen}
        onClose={() => setPdfPickerOpen(false)}
        onPick={handlePDFPick}
        generating={generating}
      />

      {/* کامپوننت مخفی برای تولید PDF */}
      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
        aria-hidden
      >
        {pdfRange && (
          <PDFReport
            ref={pdfRef}
            expenses={pdfFiltered}
            categories={categories}
            dateRangeLabel={pdfRange.label}
            startDate={pdfRange.start}
            endDate={pdfRange.end}
            userName={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "کاربر"}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, suffix, hint, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="card !p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs">
        <span style={{ color: color ?? "var(--color-primary)" }}>{icon}</span>
        {label}
      </div>
      <p
        className="text-lg font-extrabold tabular-nums mt-2 leading-tight"
        style={{ color }}
      >
        {value}
      </p>
      {suffix && <p className="text-[10px] text-text-dim mt-0.5">{suffix}</p>}
      {hint && <p className="text-[11px] text-text-muted mt-1 truncate">{hint}</p>}
    </div>
  );
}

function CategoryLegend({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const data = useMemo(() => {
    const map = new Map<number, { total: number; items: Expense[] }>();
    for (const e of expenses) {
      if (!map.has(e.categoryId)) {
        map.set(e.categoryId, { total: 0, items: [] });
      }
      const entry = map.get(e.categoryId)!;
      entry.total += e.amount;
      entry.items.push(e);
    }

    return [...map.entries()]
      .map(([id, { total, items }]) => {
        const c = categories.find((x) => x.id === id);
        return {
          id,
          name: c?.name ?? "—",
          value: total,
          color: c?.color ?? "#888",
          icon: c?.icon ?? "💸",
          items: items.sort((a, b) => b.amount - a.amount),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <>
      {data.map((d) => {
        const pct = (d.value / total) * 100;
        const isOpen = expanded === d.id;
        const isMisc = d.name === "متفرقه" || d.name === "دیگر";

        return (
          <div
            key={d.id}
            className="rounded-2xl overflow-hidden transition-colors"
            style={{
              background: isOpen ? "var(--color-bg-hover)" : "transparent",
              border: isOpen ? `1px solid ${d.color}33` : "1px solid transparent",
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : d.id)}
              className="w-full flex items-center gap-3 py-3 px-3 active:scale-[0.99] transition-transform"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{
                  background: d.color + "22",
                  border: `1px solid ${d.color}33`,
                }}
              >
                {d.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-semibold truncate">{d.name}</span>
                  <span className="text-[11px] text-text-muted tabular-nums shrink-0 mr-2">
                    {toFa(pct.toFixed(1))}٪
                  </span>
                </div>
                <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: d.color,
                      boxShadow: `0 0 8px ${d.color}66`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] font-bold tabular-nums">
                  {formatMoney(d.value)}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} className="text-text-dim" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 space-y-1">
                    {d.items.map((item) => {
                      const title = isMisc && item.note ? item.note : item.note || "بدون توضیح";
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                          style={{ background: "var(--color-bg-card)" }}
                        >
                          <div className="w-1 h-1 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-[12px] truncate flex-1 text-text-muted">{title}</span>
                          <span className="text-[10px] text-text-dim shrink-0">{relativeDay(item.date)}</span>
                          <span className="text-[12px] font-bold tabular-nums shrink-0 mr-1">
                            {formatMoney(item.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
