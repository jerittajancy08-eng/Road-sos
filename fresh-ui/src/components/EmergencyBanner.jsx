import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EmergencyBanner({ mode, message }) {
  const isSuccess = mode === "arrived";
  const isAlert = mode === "alert";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[1.75rem] border px-5 py-4 shadow-sm backdrop-blur-xl ${isSuccess ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-red-500/20 bg-red-500/10 text-red-100"}`}
    >
      <div className="flex items-center gap-3">
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
        <div>
          <p className="text-sm font-semibold">{isSuccess ? "Responder arrived safely" : "Accident detected"}</p>
          <p className="mt-1 text-sm text-slate-100/80">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
