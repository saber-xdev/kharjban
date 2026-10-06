import { Home, List, PieChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export type Tab = "home" | "list" | "report" | "settings";

const items: { key: Tab; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "خانه", Icon: Home },
  { key: "list", label: "لیست", Icon: List },
  { key: "report", label: "گزارش", Icon: PieChart },
  { key: "settings", label: "تنظیمات", Icon: Settings },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "rgba(7, 10, 13, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        borderTop: "1px solid rgba(16, 185, 129, 0.08)",
        willChange: "backdrop-filter",
        transform: "translateZ(0)",
      }}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 pt-2 pb-1">
        {items.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors duration-200",
                isActive ? "text-primary" : "text-text-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-x-2 inset-y-0 rounded-2xl -z-10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(16,185,129,0.14), rgba(16,185,129,0.06))",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                  transition={{
                    type: "spring",
                    damping: 22,
                    stiffness: 380,
                    mass: 0.6,
                  }}
                />
              )}

              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
