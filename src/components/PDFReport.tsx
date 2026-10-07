import { forwardRef } from "react";
import { formatMoney, toFa, relativeDay, formatJalaliFull, dayKey } from "../lib/format";
import type { Category, Expense } from "../types";

interface Props {
  expenses: Expense[];
  categories: Category[];
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  userName: string;
}

export const PDFReport = forwardRef<HTMLDivElement, Props>(
  function PDFReport(
    { expenses, categories, dateRangeLabel, startDate, endDate, userName },
    ref
  ) {
    const catMap = new Map(categories.map((c) => [c.id!, c]));

    const totals = expenses.reduce(
      (a, e) => {
        if (e.type === "income") a.income += e.amount;
        else a.expense += e.amount;
        return a;
      },
      { income: 0, expense: 0 }
    );
    const balance = totals.income - totals.expense;

    const expenseList = expenses.filter((e) => e.type !== "income");
    const catTotals = new Map<number, number>();
    for (const e of expenseList) {
      catTotals.set(e.categoryId, (catTotals.get(e.categoryId) ?? 0) + e.amount);
    }
    const catData = [...catTotals.entries()]
      .map(([id, val]) => {
        const c = catMap.get(id);
        return {
          name: c?.name ?? "—",
          icon: c?.icon ?? "💸",
          color: c?.color ?? "#888",
          value: val,
        };
      })
      .sort((a, b) => b.value - a.value);
    const maxCatValue = catData[0]?.value ?? 1;

    const dayMap = new Map<string, Expense[]>();
    for (const e of expenses) {
      const k = dayKey(e.date);
      if (!dayMap.has(k)) dayMap.set(k, []);
      dayMap.get(k)!.push(e);
    }
    const grouped = [...dayMap.entries()].sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    );

    return (
      <div
        ref={ref}
        style={{
          width: "800px",
          background: "#0A0E12",
          color: "#EAF2F0",
          fontFamily: "Vazirmatn, system-ui, sans-serif",
          direction: "rtl",
        }}
      >
        {/* ==== هدر + بازه + آمار + تعداد (یه بخش) ==== */}
        <div data-pdf-section>
          {/* هدر */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #0F766E 0%, #10B981 50%, #047857 100%)",
              padding: "40px 48px 36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                left: "-50px",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-80px",
                right: "-40px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  flexShrink: 0,
                }}
              >
                <img
                  src="./icon-512.png"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  crossOrigin="anonymous"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.2,
                    marginBottom: "6px",
                  }}
                >
                  گزارش مالی خرج‌بان
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                  }}
                >
                  {userName} · {dateRangeLabel}
                </div>
              </div>
            </div>
          </div>

          {/* بازه */}
          <div style={{ padding: "28px 48px 0" }}>
            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: "13px", color: "#8A9BA8" }}>بازه گزارش</div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6EE7B7",
                  fontWeight: 700,
                  direction: "rtl",
                }}
              >
                از {formatJalaliFull(startDate)} تا {formatJalaliFull(endDate)}
              </div>
            </div>
          </div>

          {/* آمار */}
          <div
            style={{
              padding: "24px 48px 0",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "14px",
            }}
          >
            <SummaryCard label="درآمد" value={formatMoney(totals.income)} suffix="تومان" color="#10B981" icon="📈" />
            <SummaryCard label="خرج" value={formatMoney(totals.expense)} suffix="تومان" color="#EF4444" icon="📉" />
            <SummaryCard label="مانده" value={formatMoney(Math.abs(balance))} suffix="تومان" color="#14B8A6" icon="⚖️" />
          </div>

          {/* تعداد */}
          <div style={{ padding: "16px 48px 28px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "#8A9BA8" }}>تعداد کل تراکنش‌ها</span>
              <span style={{ color: "#EAF2F0", fontWeight: 700 }}>
                {toFa(expenses.length)} مورد
              </span>
            </div>
          </div>
        </div>

        {/* ==== سهم دسته‌ها (یه بخش) ==== */}
        {catData.length > 0 && (
          <div data-pdf-section style={{ padding: "0 48px 28px" }}>
            <SectionTitle title="سهم دسته‌ها" icon="🍩" />
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px",
                padding: "22px 24px",
                marginTop: "14px",
              }}
            >
              {catData.map((c, i) => {
                const pct = (c.value / (totals.expense || 1)) * 100;
                const barPct = (c.value / maxCatValue) * 100;
                return (
                  <div key={i} style={{ marginBottom: i === catData.length - 1 ? 0 : "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{c.icon}</span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#EAF2F0" }}>
                          {c.name}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "#8A9BA8", fontWeight: 600 }}>
                          {toFa(pct.toFixed(1))}٪
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#EAF2F0" }}>
                          {formatMoney(c.value)}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${barPct}%`,
                          height: "100%",
                          background: c.color,
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==== لیست تراکنش‌ها (بخش با روزها) ==== */}
        {grouped.length > 0 && (
          <div data-pdf-section>
            {/* تایتل قبل از روزها */}
            <div data-pdf-pre style={{ padding: "0 48px 14px" }}>
              <SectionTitle title="لیست تراکنش‌ها" icon="📋" />
            </div>

            {/* روزها */}
            {grouped.map(([day, items]) => {
              const dayTotal = items.reduce(
                (a, e) => {
                  if (e.type === "income") a.income += e.amount;
                  else a.expense += e.amount;
                  return a;
                },
                { income: 0, expense: 0 }
              );

              return (
                <div key={day} data-pdf-day style={{ padding: "0 48px 22px" }}>
                  {/* هدر روز */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 16px",
                      background: "rgba(16,185,129,0.10)",
                      borderRadius: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#10B981",
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#6EE7B7" }}>
                        {relativeDay(items[0].date)}
                      </span>
                      <span style={{ fontSize: "11px", color: "#5A6070" }}>
                        ({toFa(items.length)} مورد)
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontWeight: 600 }}>
                      {dayTotal.income > 0 && (
                        <span style={{ color: "#10B981" }}>
                          +{formatMoney(dayTotal.income)}
                        </span>
                      )}
                      {dayTotal.expense > 0 && (
                        <span style={{ color: "#EF4444" }}>
                          −{formatMoney(dayTotal.expense)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* تراکنش‌ها */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {items.map((e) => {
                      const cat = catMap.get(e.categoryId);
                      const isIncome = e.type === "income";
                      const isMisc = cat?.name === "متفرقه" || cat?.name === "دیگر";
                      const title = isMisc ? e.note || cat?.name || "—" : cat?.name ?? "—";
                      const subtitle = isMisc && e.note ? null : e.note ? e.note : null;

                      return (
                        <div
                          key={e.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 14px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.04)",
                            borderRadius: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "11px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              background: (cat?.color ?? "#888") + "20",
                              border: `1px solid ${(cat?.color ?? "#888")}40`,
                              flexShrink: 0,
                            }}
                          >
                            {cat?.icon ?? (isIncome ? "📈" : "💸")}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#EAF2F0" }}>
                              {title}
                            </div>
                            {subtitle && (
                              <div style={{ fontSize: "11px", color: "#8A9BA8", marginTop: "2px" }}>
                                {subtitle}
                              </div>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 800,
                              color: isIncome ? "#10B981" : "#EAF2F0",
                              direction: "rtl",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isIncome ? "+" : "−"}
                            {formatMoney(e.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==== خالی ==== */}
        {expenses.length === 0 && (
          <div data-pdf-section style={{ padding: "60px 48px", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>📭</div>
            <div style={{ fontSize: "18px", color: "#8A9BA8", fontWeight: 500 }}>
              در این بازه تراکنشی ثبت نشده
            </div>
          </div>
        )}

        {/* ==== فوتر ==== */}
        <div data-pdf-section style={{ padding: "22px 48px 36px" }}>
          <div
            style={{
              paddingTop: "22px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#5A6070",
            }}
          >
            <div>ساخته شده توسط خرج‌بان</div>
            <div style={{ direction: "rtl" }}>
              تاریخ تولید:{" "}
              <span style={{ color: "#8A9BA8", fontWeight: 600 }}>
                {formatJalaliFull(new Date().toISOString())}
              </span>
            </div>
          </div>

          <div style={{ paddingTop: "16px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: "999px",
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.25)",
                fontSize: "12px",
                color: "#6EE7B7",
                fontWeight: 600,
              }}
            >
              ساخته شده توسط شیخ صابر کبیر · @xdevu
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function SummaryCard({
  label, value, suffix, color, icon,
}: {
  label: string;
  value: string;
  suffix: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: `linear-gradient(155deg, ${color}18 0%, rgba(15,21,28,1) 80%)`,
        border: `1px solid ${color}35`,
        borderRadius: "16px",
        padding: "18px 16px",
      }}
    >
      <div style={{ fontSize: "18px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "11px", color: "#8A9BA8", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: "20px", fontWeight: 800, color: color, marginBottom: "2px" }}>
        {value}
      </div>
      <div style={{ fontSize: "10px", color: "#5A6070" }}>{suffix}</div>
    </div>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span style={{ fontSize: "16px", fontWeight: 800, color: "#EAF2F0" }}>
        {title}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(90deg, rgba(16,185,129,0.3), transparent)",
        }}
      />
    </div>
  );
}
