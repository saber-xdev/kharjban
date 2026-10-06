import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#070A0D" }}
    >
      {/* گرید پترن */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      {/* هاله نور زمردی */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[420px] h-[420px] rounded-full blur-[80px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #10B981 0%, #047857 35%, transparent 70%)",
        }}
      />

      {/* هاله بنفش مکمل */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[70px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
        }}
      />

      {/* حلقه‌های نور */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.35, 1.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-72 h-72 rounded-full border pointer-events-none"
        style={{ borderColor: "rgba(16,185,129,0.5)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.55, 2.1] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.6,
        }}
        className="absolute w-72 h-72 rounded-full border pointer-events-none"
        style={{ borderColor: "rgba(16,185,129,0.35)" }}
      />

      {/* لوگو */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            filter: [
              "drop-shadow(0 0 32px rgba(16,185,129,0.6))",
              "drop-shadow(0 0 56px rgba(16,185,129,0.95))",
              "drop-shadow(0 0 32px rgba(16,185,129,0.6))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-[28px] overflow-hidden relative"
          style={{
            boxShadow:
              "0 0 60px rgba(16,185,129,0.5), 0 0 120px rgba(16,185,129,0.3), 0 1px 0 rgba(255,255,255,0.1) inset",
          }}
        >
          <img
            src="/icon-512.png"
            alt="خرج‌بان"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* اسم اپ */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-[38px] font-extrabold mt-9 relative z-10 leading-[1.4] pb-2 tracking-tight"
        style={{
          background:
            "linear-gradient(135deg, #6EE7B7 0%, #10B981 50%, #047857 100%)",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shine 3.5s ease-in-out infinite",
          filter: "drop-shadow(0 0 32px rgba(16,185,129,0.6))",
        }}
      >
        خرج‌بان
      </motion.h1>

      {/* خط جداکننده */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 120 }}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="h-px rounded-full mt-5 relative z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, #10B981, transparent)",
          boxShadow: "0 0 20px rgba(16,185,129,0.8)",
        }}
      />

      {/* امضا */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-7 text-center space-y-2.5 relative z-10"
      >
        <p
          className="text-[11px] font-medium tracking-wide uppercase"
          style={{ color: "#8A9BA8", letterSpacing: "0.08em" }}
        >
          ساخته شده توسط
        </p>
        <p
          className="text-[22px] font-extrabold leading-[1.5] pb-1 tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, #EAF2F0 0%, #6EE7B7 50%, #EAF2F0 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shine 4.5s ease-in-out infinite",
          }}
        >
          شیخ صابر کبیر
        </p>
        <motion.a
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          href="https://t.me/xdevu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold tracking-tight"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "#6EE7B7",
            boxShadow:
              "0 0 24px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#10B981",
              boxShadow: "0 0 8px #10B981",
              animation: "pulse-soft 1.6s ease-in-out infinite",
            }}
          />
          @xdevu
        </motion.a>
      </motion.div>

      {/* نوار پیشرفت */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-12 w-36 h-px rounded-full origin-right"
        style={{
          background:
            "linear-gradient(90deg, transparent, #10B981, transparent)",
          boxShadow: "0 0 12px rgba(16,185,129,0.6)",
        }}
      />

      <style>{`
        @keyframes shine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </motion.div>
  );
}
