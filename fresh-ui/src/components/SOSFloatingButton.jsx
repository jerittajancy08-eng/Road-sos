import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function SOSFloatingButton({ onActivate, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onActivate}
      className="absolute bottom-6 right-6 z-[100] flex items-center gap-3 rounded-full border border-white/10 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_60px_rgba(239,68,68,0.35)] transition-transform will-change-transform"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 shadow-[0_0_30px_rgba(239,68,68,0.35)] text-red-100">
        <AlertTriangle size={20} />
      </span>
      <span>{disabled ? "Awaiting..." : "Dispatch SOS"}</span>
    </motion.button>
  );
}
