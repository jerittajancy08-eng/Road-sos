import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[9999] overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        {/* Pulsing circles behind logo */}
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative bg-slate-900 w-32 h-32 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl">
          <span className="text-6xl">🆘</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-black italic tracking-tighter text-white">ROADSOS</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Emergency Response Network</p>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-red-500 w-full"
          />
        </div>
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Initializing Secure Connection</span>
      </div>
    </div>
  );
}
