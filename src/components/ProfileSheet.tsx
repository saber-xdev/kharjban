import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, User as UserIcon, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./AuthGate";
import { hashPassword, verifyPassword } from "../lib/auth";
import { useToast } from "./ui/Toast";

type Mode = "profile" | "password";

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
};

export function ProfileSheet({ open, mode, onClose }: Props) {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setError("");
      setShowPass(false);
    }
  }, [open, user]);

  const isProfile = mode === "profile";

  const canSaveProfile =
    firstName.trim().length >= 2 && lastName.trim().length >= 2;

  const canSavePassword =
    currentPass.length >= 4 &&
    newPass.length >= 4 &&
    newPass === confirmPass;

  const canSave = isProfile ? canSaveProfile : canSavePassword;

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    if (!canSaveProfile || saving) return;
    setSaving(true);
    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toast("پروفایل ذخیره شد ✓");
      onClose();
    } catch {
      toast("خطا در ذخیره", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (!canSavePassword || !user || saving) return;
    setError("");
    setSaving(true);
    try {
      const ok = await verifyPassword(currentPass, user.passwordHash);
      if (!ok) {
        setError("رمز فعلی اشتباهه");
        setSaving(false);
        return;
      }
      const newHash = await hashPassword(newPass);
      await updateUser({ passwordHash: newHash });
      toast("رمز عبور تغییر کرد ✓");
      onClose();
    } catch {
      toast("خطا در تغییر رمز", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="fixed bottom-0 inset-x-0 z-[101] max-w-md mx-auto
                       bg-bg-card rounded-t-3xl border-t border-x border-bg-border
                       pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold">
                {isProfile ? "ویرایش پروفایل" : "تغییر رمز عبور"}
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-hover flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-6">
              {isProfile ? (
                <form onSubmit={handleProfile} className="space-y-4">
                  {/* پیش‌نمایش */}
                  <div className="flex justify-center mb-2">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-primary-light), var(--color-primary-dark))",
                        color: "#fff",
                        boxShadow: "0 8px 32px rgba(var(--primary-rgb),0.4)",
                      }}
                    >
                      {firstName?.charAt(0) || "?"}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                      نام
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="نام"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="نام خانوادگی"
                      className="input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canSave || saving}
                    className="w-full py-4 text-base font-bold rounded-2xl text-white disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
                      boxShadow: canSave
                        ? "0 8px 24px rgba(var(--primary-rgb),0.4)"
                        : "none",
                    }}
                  >
                    <Check size={20} />
                    {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePassword} className="space-y-4">
                  <div>
                    <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                      رمز فعلی
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="رمز فعلی"
                        className="input !pr-11 !pl-11"
                      />
                      <Lock
                        size={16}
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-text-dim"
                      />
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
                    <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                      رمز جدید
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="حداقل ۴ کاراکتر"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted mb-1.5 block px-1">
                      تکرار رمز جدید
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="دوباره وارد کن"
                      className="input"
                    />
                  </div>

                  {confirmPass && newPass !== confirmPass && (
                    <p className="text-[11px] text-danger px-1">
                      رمزها یکسان نیستند
                    </p>
                  )}

                  {error && (
                    <p className="text-[11px] text-danger text-center px-1">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!canSave || saving}
                    className="w-full py-4 text-base font-bold rounded-2xl text-white disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
                      boxShadow: canSave
                        ? "0 8px 24px rgba(var(--primary-rgb),0.4)"
                        : "none",
                    }}
                  >
                    <Check size={20} />
                    {saving ? "در حال ذخیره..." : "تغییر رمز"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
