import {
  createContext, useContext, useEffect, useState, useRef,
  type ReactNode, type FormEvent,
} from "react";
import { motion } from "framer-motion";
import { Lock, User as UserIcon, Eye, EyeOff, Sparkles, LogIn } from "lucide-react";
import { db } from "../db/db";
import { hashPassword, verifyPassword } from "../lib/auth";
import type { User } from "../types";

const SESSION_KEY = "kharjban-session";
const LOCK_DELAY = 10 * 1000;

interface AuthCtxValue {
  user: User | null;
  lock: () => void;
  updateUser: (patch: Partial<User>) => Promise<void>;
}
const Ctx = createContext<AuthCtxValue>({
  user: null,
  lock: () => {},
  updateUser: async () => {},
});
export const useAuth = () => useContext(Ctx);

type Status = "loading" | "register" | "locked" | "ready";

export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const lockTimerRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const count = await db.users.count();
      if (count === 0) {
        setStatus("register");
        return;
      }
      const u = (await db.users.toCollection().first()) ?? null;
      setUser(u);
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session === "active") setStatus("ready");
      else setStatus("locked");
    })();
  }, []);

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = window.setTimeout(() => {
          sessionStorage.removeItem(SESSION_KEY);
          setStatus((s) => (s === "ready" ? "locked" : s));
          lockTimerRef.current = null;
        }, LOCK_DELAY);
      } else {
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  function unlock(u: User) {
    sessionStorage.setItem(SESSION_KEY, "active");
    setUser(u);
    setStatus("ready");
  }

  function lock() {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    sessionStorage.removeItem(SESSION_KEY);
    setStatus("locked");
  }

  async function updateUser(patch: Partial<User>) {
    if (!user?.id) return;
    await db.users.update(user.id, patch);
    const updated = await db.users.get(user.id);
    if (updated) setUser(updated);
  }

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#070A0D" }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--color-primary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (status === "register") {
    return <RegisterScreen onDone={unlock} />;
  }

  if (status === "locked" && user) {
    return <LockScreen user={user} onUnlock={() => unlock(user)} />;
  }

  return (
    <Ctx.Provider value={{ user, lock, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

/* ==================== صفحه ثبت‌نام ==================== */
function RegisterScreen({ onDone }: { onDone: (u: User) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    password.length >= 4 &&
    password === confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      const id = await db.users.add({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      });
      const user = await db.users.get(id);
      if (user) onDone(user);
    } catch {
      setError("خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-10 relative overflow-hidden"
      style={{ background: "#070A0D" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, var(--color-primary-deep) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mt-4"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl overflow-hidden"
            style={{
              boxShadow:
                "0 0 50px rgba(var(--primary-rgb),0.5), 0 0 100px rgba(var(--primary-rgb),0.25)",
            }}
          >
            <img src="/icon-512.png" alt="خرج‌بان" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <h1
          className="text-3xl font-extrabold text-center leading-[1.4] pb-2 tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-bright) 0%, var(--color-primary) 50%, var(--color-primary-deep) 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shine 4s ease-in-out infinite",
          }}
        >
          خرج‌بان
        </h1>

        <p className="text-center text-text-muted text-sm mt-3 mb-8">
          خوش آمدی 👋 <br />
          <span className="text-xs">برای شروع، اطلاعاتت رو وارد کن</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block px-1">نام</label>
            <div className="relative">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثلاً سجاد"
                className="input !pr-11"
              />
              <UserIcon size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block px-1">نام خانوادگی</label>
            <div className="relative">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثلاً محمدی"
                className="input !pr-11"
              />
              <UserIcon size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block px-1">رمز عبور</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۴ کاراکتر"
                className="input !pr-11 !pl-11"
              />
              <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim" />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute top-1/2 -translate-y-1/2 left-4 text-text-dim active:scale-90"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block px-1">تکرار رمز عبور</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="دوباره وارد کن"
                className="input !pr-11"
              />
              <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim" />
            </div>
          </div>

          {confirm && password !== confirm && (
            <p className="text-[11px] text-danger px-1">رمزها یکسان نیستند</p>
          )}

          {error && (
            <p className="text-[11px] text-danger text-center px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{
              background:
                "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
              boxShadow: canSubmit
                ? "0 12px 32px rgba(var(--primary-rgb),0.45), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "none",
            }}
          >
            <Sparkles size={18} />
            {loading ? "در حال آماده‌سازی..." : "شروع کنیم"}
          </button>
        </form>

        <p className="text-center text-[10px] text-text-dim mt-6 leading-5">
          اطلاعات فقط روی همین گوشی ذخیره می‌شود
        </p>
      </motion.div>
    </div>
  );
}

/* ==================== صفحه قفل ==================== */
function LockScreen({
  user,
  onUnlock,
}: {
  user: User;
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return;
    const ok = await verifyPassword(password, user.passwordHash);
    if (ok) {
      onUnlock();
    } else {
      setError("رمز اشتباهه");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword("");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: "#070A0D" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, var(--color-primary-deep) 40%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-3xl overflow-hidden"
            style={{
              boxShadow:
                "0 0 50px rgba(var(--primary-rgb),0.5), 0 0 100px rgba(var(--primary-rgb),0.25)",
            }}
          >
            <img src="/icon-512.png" alt="خرج‌بان" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <h1
          className="text-2xl font-extrabold text-center leading-[1.5] pb-2 tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-bright) 0%, var(--color-primary) 50%, var(--color-primary-deep) 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shine 4s ease-in-out infinite",
          }}
        >
          خوش برگشتی، {user.firstName}
        </h1>

        <p className="text-center text-text-muted text-xs mt-2 mb-8">
          برای ادامه رمزت رو وارد کن
        </p>

        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              className="input !pr-11 !pl-11 text-center font-bold"
              autoFocus
            />
            <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim" />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute top-1/2 -translate-y-1/2 left-4 text-text-dim active:scale-90"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-[11px] text-danger text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{
              background:
                "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
              boxShadow: password
                ? "0 12px 32px rgba(var(--primary-rgb),0.45), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "none",
            }}
          >
            <LogIn size={18} />
            ورود
          </button>
        </motion.form>

        <p className="text-center text-[10px] text-text-dim mt-6 leading-5">
          {user.firstName} {user.lastName} عزیز
          <br />
          داده‌های شما فقط روی این گوشی محفوظ است
        </p>
      </motion.div>
    </div>
  );
}
