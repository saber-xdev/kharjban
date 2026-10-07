import { motion } from "framer-motion";

export function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center pt-4 pb-2"
    >
      <div
        className="w-12 h-12 rounded-2xl overflow-hidden relative"
        style={{
          boxShadow:
            "0 4px 16px rgba(var(--primary-rgb),0.3), 0 0 0 1px rgba(var(--primary-rgb),0.2)",
        }}
      >
        <img
          src="./icon-192.png"
          alt="خرج‌بان"
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}
