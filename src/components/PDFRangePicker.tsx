import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileDown, Calendar, Loader2 } from "lucide-react";
import { formatJalaliFull } from "../lib/format";

type RangeKey =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "custom";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "امروز" },
  { key: "yesterday", label: "دیروز" },
  { key: "this_week", label: "هفته جاری" },
  { key: "last_week", label: "هفته گذشته" },
  { key: "this_month", label: "ماه جاری" },
  { key: "last_month", label: "ماه گذشته" },
  { key: "custom", label: "بازه دلخواه" },
];

export interface DateRange {
  start: string;
  end: string;
  label: string;
}

export function PDFRangePicker({
  open,
  onClose,
  onPick,
  generating,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (range: DateRange) => void;
  generating: boolean;
}) {
  const [selected, setSelected] = useState<RangeKey>("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function computeRange(key: RangeKey): DateRange | null {
    const now = new Date();
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (key === "today") {
      const s = startOfDay(now);
      return { start: s.toISOString(), end: now.toISOString(), label: "امروز" };
    }
    if (key === "yesterday") {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      const s = startOfDay(y);
      const e = new Date(s);
      e.setHours(23, 59, 59, 999);
      return { start: s.toISOString(), end: e.toISOString(), label: "دیروز" };
    }
    if (key === "this_week") {
      const s = new Date(now);
      const dow = s.getDay();
      const offset = dow === 6 ? 0 : dow + 1;
      s.setDate(s.getDate() - offset);
      s.setHours(0, 0, 0, 0);
      return { start: s.toISOString(), end: now.toISOString(), label: "هفته جاری" };
    }
    if (key === "last_week") {
      const s = new Date(now);
      const dow = s.getDay();
      const offset = dow === 6 ? 0 : dow + 1;
      s.setDate(s.getDate() - offset - 7);
      s.setHours(0, 0, 0, 0);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return { start: s.toISOString(), end: e.toISOString(), label: "هفته گذشته" };
    }
    if (key === "this_month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: s.toISOString(), end: now.toISOString(), label: "ماه جاری" };
    }
    if (key === "last_month") {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      e.setHours(23, 59, 59, 999);
      return { start: s.toISOString(), end: e.toISOString(), label: "ماه گذشته" };
    }
    return null;
  }

  function handleGenerate() {
    if (selected === "custom") {
      if (!customStart || !customEnd) return;
      const s = new Date(customStart);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      if (s > e) return;
      onPick({
        start: s.toISOString(),
        end: e.toISOString(),
        label: "بازه دلخواه",
      });
      return;
    }
    const r = computeRange(selected);
    if (r) onPick(r);
  }

  const canGenerate =
    selected !== "custom" || (customStart && customEnd);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={generating ? undefined : onClose}
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
              <div className="flex items-center gap-2">
                <FileDown size={20} className="text-primary" />
                <h2 className="text-lg font-bold">گزارش PDF</h2>
              </div>
              <button
                onClick={onClose}
                disabled={generating}
                className="w-9 h-9 rounded-full bg-bg-hover flex items-center justify-center disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-5">
              <p className="text-[12px] text-text-muted leading-6">
                بازه گزارش را انتخاب کن، سپس فایل PDF با طراحی حرفه‌ای
                ساخته و دانلود می‌شود.
              </p>

              <div>
                <label className="text-[11px] text-text-muted mb-2 block px-1">
                  بازه گزارش
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RANGES.map((r) => {
                    const active = r.key === selected;
                    return (
                      <button
                        key={r.key}
                        onClick={() => setSelected(r.key)}
                        disabled={generating}
                        className="py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          background: active
                            ? "linear-gradient(180deg, var(--color-primary-light), var(--color-primary-dark))"
                            : "var(--color-bg-hover)",
                          color: active ? "#fff" : "var(--color-text-muted)",
                          border: `1px solid ${
                            active ? "transparent" : "var(--color-bg-border)"
                          }`,
                          boxShadow: active
                            ? "0 6px 20px rgba(var(--primary-rgb),0.35)"
                            : "none",
                        }}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {selected === "custom" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-text-muted mb-1.5 block">
                          از تاریخ
                        </label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          className="input !py-2.5 !px-3 text-xs tabular-nums"
                          style={{ colorScheme: "dark" }}
                          disabled={generating}
                        />
                        {customStart && (
                          <p className="text-[10px] text-text-dim mt-1 truncate">
                            {formatJalaliFull(new Date(customStart).toISOString())}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted mb-1.5 block">
                          تا تاریخ
                        </label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          className="input !py-2.5 !px-3 text-xs tabular-nums"
                          style={{ colorScheme: "dark" }}
                          disabled={generating}
                        />
                        {customEnd && (
                          <p className="text-[10px] text-text-dim mt-1 truncate">
                            {formatJalaliFull(new Date(customEnd).toISOString())}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className="w-full py-4 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background:
                    "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
                  boxShadow: canGenerate
                    ? "0 12px 32px rgba(var(--primary-rgb),0.45), inset 0 1px 0 rgba(255,255,255,0.25)"
                    : "none",
                }}
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    در حال ساخت PDF...
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    ساخت گزارش PDF
                  </>
                )}
              </button>

              {generating && (
                <p className="text-[11px] text-text-muted text-center">
                  لطفاً صبر کن... چند ثانیه طول می‌کشد
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
