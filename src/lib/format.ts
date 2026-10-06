const faDigits = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => faDigits[+d]);
}

export function formatMoney(n: number, withFa = true): string {
  const s = n.toLocaleString("en-US");
  return withFa ? toFa(s) : s;
}

export function formatJalali(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "long",
  }).format(d);
}

export function formatJalaliFull(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// همیشه تاریخ شمسی برمی‌گردونه (مثلاً «۱۲ مهر»)
export function relativeDay(iso: string): string {
  return formatJalali(iso);
}
