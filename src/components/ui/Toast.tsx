import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; msg: string; kind?: "success" | "error" };
const Ctx = createContext<(msg: string, kind?: "success" | "error") => void>(
  () => {}
);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback(
    (msg: string, kind: "success" | "error" = "success") => {
      const id = Date.now();
      setItems((p) => [...p, { id, msg, kind }]);
      setTimeout(
        () => setItems((p) => p.filter((t) => t.id !== id)),
        1600
      );
    },
    []
  );

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className={
                "px-5 py-3 rounded-2xl text-sm font-medium shadow-soft backdrop-blur-lg " +
                (t.kind === "error"
                  ? "bg-danger/90 text-white"
                  : "bg-primary/90 text-white")
              }
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
