import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo, memo } from "react";
import type { Category, Expense } from "../../types";
import { formatMoney } from "../../lib/format";

export const CategoryPie = memo(function CategoryPie({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const data = useMemo(() => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    const map = new Map<number, number>();
    for (const e of expenses) {
      if (e.date < start) continue;
      map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount);
    }

    return [...map.entries()]
      .map(([id, value]) => {
        const c = categories.find((x) => x.id === id);
        return { name: c?.name ?? "—", value, color: c?.color ?? "#888" };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  if (data.length === 0) {
    return (
      <p className="text-center text-text-muted text-sm py-8">
        داده‌ای برای این ماه نیست
      </p>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            stroke="none"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-bg-border)",
              borderRadius: 12,
              fontFamily: "Vazirmatn",
              direction: "rtl",
            }}
            formatter={(v: number) => formatMoney(v) + " تومان"}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-text-muted">این ماه</p>
        <p className="text-sm font-bold tabular-nums mt-1">
          {formatMoney(total)}
        </p>
      </div>
    </div>
  );
});
