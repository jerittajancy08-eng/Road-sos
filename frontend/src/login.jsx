import React, { useState } from "react";
import { motion } from "framer-motion";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name) return;
    onLogin({ name, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div className="text-center mb-14">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
            className="inline-block bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-[2.5rem] shadow-2xl shadow-red-900/40 mb-6 border border-white/20"
          >
            <span className="text-4xl">🆘</span>
          </motion.div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">ROADSOS</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 ml-1 opacity-80">Access Control Protocol</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-6">Operator Identity</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-700 font-bold tracking-tight shadow-inner"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-6">Service Assignment</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'user', label: 'Victim', icon: '👤', color: 'red' },
                { id: 'helper', label: 'Helper', icon: '🤝', color: 'blue' },
                { id: 'police', label: 'Police', icon: '🛡️', color: 'gold' },
                { id: 'hospital', label: 'Hospital', icon: '🏥', color: 'emerald' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all duration-300 group ${
                    role === r.id 
                    ? 'bg-white/5 border-red-500/50 text-white shadow-2xl shadow-red-900/10' 
                    : 'bg-slate-950/30 border-white/5 text-slate-500 grayscale opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl mb-1 transition-transform duration-300 group-hover:scale-110">{r.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest tracking-tight">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -15px rgba(220, 38, 38, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-900/20 transition-all mt-6 uppercase tracking-widest text-xs italic"
          >
            Authorize Connection
          </motion.button>
        </form>

        <div className="mt-12 pt-10 border-t border-white/5 flex flex-col items-center gap-4">
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
           </div>
           <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] text-center leading-relaxed">
             Secure Multi-Channel Hub<br/>
             Authorized Operational Access Only
           </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;