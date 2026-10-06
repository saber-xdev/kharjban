import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type Tab } from "./components/layout/BottomNav";
import { Home } from "./pages/Home";
import { List } from "./pages/List";
import { Report } from "./pages/Report";
import { Settings } from "./pages/Settings";
import { Categories } from "./pages/Categories";
import { ToastProvider } from "./components/ui/Toast";
import { ExpenseSheet } from "./components/expense/ExpenseSheet";
import { SplashScreen } from "./components/SplashScreen";
import { AuthGate } from "./components/AuthGate";
import { seedIfEmpty } from "./db/seed";
import { requestPersistentStorage } from "./db/db";

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

export default function App() {
  return (
    <ToastProvider>
      <AuthGate>
        <MainApp />
      </AuthGate>
    </ToastProvider>
  );
}

function MainApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    requestPersistentStorage();
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  function openAdd() {
    setEditingId(null);
    setSheetOpen(true);
  }

  function openEdit(id: number) {
    setEditingId(id);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingId(null);
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className="min-h-screen max-w-md mx-auto relative overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {showCategories ? (
            <motion.div
              key="categories"
              initial={PAGE_TRANSITION.initial}
              animate={PAGE_TRANSITION.animate}
              exit={PAGE_TRANSITION.exit}
              transition={PAGE_TRANSITION.transition}
            >
              <Categories onClose={() => setShowCategories(false)} />
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={PAGE_TRANSITION.initial}
              animate={PAGE_TRANSITION.animate}
              exit={PAGE_TRANSITION.exit}
              transition={PAGE_TRANSITION.transition}
            >
              {tab === "home" && <Home onAdd={openAdd} onEdit={openEdit} />}
              {tab === "list" && <List onEdit={openEdit} />}
              {tab === "report" && <Report />}
              {tab === "settings" && (
                <Settings onOpenCategories={() => setShowCategories(true)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showCategories && <BottomNav active={tab} onChange={setTab} />}

        <ExpenseSheet
          open={sheetOpen}
          onClose={closeSheet}
          editingId={editingId}
        />
      </div>
    </>
  );
}
