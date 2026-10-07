import { useRef, useState } from "react";
import {
  Trash2, Download, Upload, RefreshCw, Send, Moon, Sun, Check,
  Lock as LockIcon, User as UserIcon, KeyRound, Tag, ChevronLeft,
} from "lucide-react";
import { db } from "../db/db";
import { seedIfEmpty } from "../db/seed";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { useTheme, COLOR_PALETTES } from "../hooks/useTheme";
import { useAuth } from "../components/AuthGate";
import { ProfileSheet } from "../components/ProfileSheet";
import { toFa } from "../lib/format";
import { PageHeader } from "../components/layout/PageHeader";

export function Settings({
  onOpenCategories,
}: {
  onOpenCategories: () => void;
}) {
  const toast = useToast();
  const expenses = useExpenses();
  const categories = useCategories();
  const { theme, color, toggleTheme, setColor } = useTheme();
  const { user, lock } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState<"profile" | "password">(
    "profile"
  );

  function openProfile(mode: "profile" | "password") {
    setProfileMode(mode);
    setProfileOpen(true);
  }

  async function handleExport() {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        categories: await db.categories.toArray(),
        expenses: await db.expenses.toArray(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `khari-ban-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("پشتیبان گرفته شد ✓");
    } catch {
      toast("خطا در پشتیبان‌گیری", "error");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.categories || !data.expenses) {
        toast("فایل نامعتبر است", "error");
        return;
      }
      await db.categories.clear();
      await db.expenses.clear();
      await db.categories.bulkAdd(data.categories);
      await db.expenses.bulkAdd(data.expenses);
      toast("بازیابی شد ✓");
    } catch {
      toast("خطا در بازیابی", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function resetAll() {
    await db.categories.clear();
    await db.expenses.clear();
    await seedIfEmpty();
    setConfirming(false);
    toast("همه چیز پاک شد ✓");
  }

  return (
    <div className="pb-32">
      <PageHeader />
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-primary">تنظیمات</h1>
      </header>

      {/* حساب کاربری */}
      <section className="px-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">حساب کاربری</h2>
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-extrabold shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(var(--primary-rgb),0.35)",
              }}
            >
              {user?.firstName?.charAt(0) || "?"}
            </div>
            <div className="flex-1 text-right min-w-0">
              <p className="text-[15px] font-bold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                کاربر این دستگاه
              </p>
            </div>
          </div>

          <div className="hairline" />

          <button
            onClick={() => openProfile("profile")}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors border-b border-bg-border"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(var(--primary-rgb),0.15)" }}
            >
              <UserIcon size={18} className="text-primary" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">ویرایش پروفایل</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                تغییر نام و نام خانوادگی
              </p>
            </div>
          </button>

          <button
            onClick={() => openProfile("password")}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors border-b border-bg-border"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.15)" }}
            >
              <KeyRound size={18} className="text-accent" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">تغییر رمز عبور</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                برای امنیت بیشتر
              </p>
            </div>
          </button>

          <button
            onClick={lock}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)" }}
            >
              <LockIcon size={18} className="text-gold" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">قفل کردن برنامه</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                برای ورود مجدد، رمز لازم می‌شود
              </p>
            </div>
          </button>
        </Card>
      </section>

      {/* آمار */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">آمار</h2>
        <Card>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-extrabold tabular-nums">
                {toFa(expenses.length)}
              </p>
              <p className="text-xs text-text-muted mt-1">تراکنش ثبت‌شده</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold tabular-nums">
                {toFa(categories.length)}
              </p>
              <p className="text-xs text-text-muted mt-1">دسته‌بندی</p>
            </div>
          </div>
        </Card>
      </section>

      {/* حالت نمایش */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">حالت نمایش</h2>
        <Card className="!p-0 overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  theme === "dark"
                    ? "rgba(139,92,246,0.15)"
                    : "rgba(245,158,11,0.15)",
              }}
            >
              {theme === "dark" ? (
                <Moon size={18} className="text-accent" />
              ) : (
                <Sun size={18} className="text-gold" />
              )}
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-medium">
                حالت {theme === "dark" ? "شب" : "روز"}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                برای تغییر ضربه بزن
              </p>
            </div>
            <div
              className="relative w-12 h-7 rounded-full transition-colors"
              style={{
                background:
                  theme === "dark"
                    ? "rgba(139,92,246,0.25)"
                    : "rgba(245,158,11,0.25)",
                border: "1px solid var(--color-bg-border)",
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  right: theme === "dark" ? "2px" : "calc(100% - 22px)",
                  background: theme === "dark" ? "#8B5CF6" : "#F59E0B",
                  boxShadow:
                    theme === "dark"
                      ? "0 0 12px rgba(139,92,246,0.6)"
                      : "0 0 12px rgba(245,158,11,0.6)",
                }}
              >
                {theme === "dark" ? (
                  <Moon size={10} className="text-white" />
                ) : (
                  <Sun size={10} className="text-white" />
                )}
              </div>
            </div>
          </button>
        </Card>
      </section>

      {/* رنگ برنامه */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">رنگ برنامه</h2>
        <Card>
          <div className="space-y-2">
            {COLOR_PALETTES.map((p) => {
              const active = p.key === color;
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    setColor(p.key);
                    toast(`رنگ ${p.name} فعال شد`);
                  }}
                  className="w-full flex items-center gap-3 py-3 px-2 rounded-2xl active:scale-[0.98] transition-all"
                  style={{
                    background: active
                      ? `rgba(var(--primary-rgb), 0.08)`
                      : "transparent",
                    border: active
                      ? `1px solid rgba(var(--primary-rgb), 0.3)`
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: p.gradient[0],
                        boxShadow: active ? `0 0 12px ${p.primary}80` : "none",
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full -mr-4"
                      style={{
                        background: p.primary,
                        border: "2px solid var(--color-bg-card)",
                        boxShadow: active ? `0 0 12px ${p.primary}80` : "none",
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full -mr-4"
                      style={{
                        background: p.gradient[2],
                        border: "2px solid var(--color-bg-card)",
                      }}
                    />
                  </div>

                  <div className="flex-1 text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: active ? p.primary : undefined }}
                    >
                      {p.name}
                    </p>
                    <p className="text-[10px] text-text-dim mt-0.5">
                      {p.primary.toUpperCase()}
                    </p>
                  </div>

                  {active && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: p.primary }}
                    >
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* پشتیبان‌گیری */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">پشتیبان‌گیری</h2>
        <div className="space-y-2">
          <Card className="!p-0 overflow-hidden">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Download size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">گرفتن پشتیبان</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  ذخیره همه داده‌ها در فایل JSON
                </p>
              </div>
            </button>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Upload size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">بازیابی از فایل</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  جایگزینی داده‌ها با فایل پشتیبان
                </p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
          </Card>
        </div>
      </section>

      {/* مدیریت */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">مدیریت</h2>
        <div className="space-y-2">
          <Card className="!p-0 overflow-hidden">
            <button
              onClick={onOpenCategories}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Tag size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">مدیریت دسته‌بندی‌ها</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  افزودن، ویرایش و حذف دسته‌ها
                </p>
              </div>
              <ChevronLeft size={16} className="text-text-dim" />
            </button>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <button
              onClick={async () => {
                await seedIfEmpty();
                toast("دسته‌ها بررسی شد ✓");
              }}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <RefreshCw size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium">بازسازی دسته‌های پیش‌فرض</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  فقط اگر دسته‌ای نباشه اضافه می‌کنه
                </p>
              </div>
            </button>
          </Card>

          <Card className="!p-0 overflow-hidden">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="w-full flex items-center gap-3 px-5 py-4 active:bg-bg-hover transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-danger/15 flex items-center justify-center">
                  <Trash2 size={18} className="text-danger" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium">پاک کردن همه داده‌ها</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    برگشت‌ناپذیر
                  </p>
                </div>
              </button>
            ) : (
              <div className="p-4 space-y-3">
                <p className="text-sm text-center leading-6">
                  مطمئنی؟ همه خرج‌ها و دسته‌ها پاک می‌شن و
                  <br />
                  <span className="text-danger font-bold">
                    قابل برگشت نیست
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirming(false)}
                    className="btn-ghost flex-1 py-3 text-sm"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={resetAll}
                    className="flex-1 py-3 text-sm rounded-2xl font-bold text-white"
                    style={{
                      background: "linear-gradient(180deg, #F87171, #EF4444)",
                    }}
                  >
                    بله، پاک کن
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* درباره */}
      <section className="px-5 mt-5">
        <h2 className="text-xs text-text-muted mb-2 px-1">درباره</h2>
        <Card>
          <div className="text-center space-y-3 py-2">
            <div>
              <p className="text-lg font-extrabold text-primary">خرج‌بان</p>
              <p className="text-[11px] text-text-dim mt-1">نسخه ۱.۰.۰</p>
            </div>
            <div className="hairline mx-auto w-16" />
            <div className="space-y-1">
              <p className="text-[11px] text-text-muted">ساخته شده توسط</p>
              <p className="text-sm font-bold">شیخ صابر کبیر</p>
              <a
                href="https://t.me/xdevu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary mt-1"
              >
                <Send size={12} />
                @xdevu
              </a>
            </div>
            <div className="hairline mx-auto w-16" />
            <p className="text-[10px] text-text-dim leading-5 px-4">
              داده‌های شما فقط روی همین گوشی ذخیره می‌شوند.
              <br />
              هیچ اطلاعاتی به سرور فرستاده نمی‌شود.
            </p>
          </div>
        </Card>
      </section>

      <ProfileSheet
        open={profileOpen}
        mode={profileMode}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
