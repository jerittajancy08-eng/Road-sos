import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function FloatingEmergencyButton({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="absolute bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-300">
        <AlertTriangle size={18} />
      </span>
      Emergency
    </motion.button>
  );
}
