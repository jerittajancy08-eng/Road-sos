import React, { useEffect, useState } from "react";
import { socket } from "../hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";

export default function HospitalDashboard({ requests: initialRequests }) {
  const [incomingPatients, setIncomingPatients] = useState(initialRequests || []);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/data/hospitals.json")
      .then(res => res.json())
      .then(data => {
        const apollo = data.find(h => h.name.includes("Apollo")) || data[0];
        setHospitalInfo(apollo);
      });

    socket.on("newSOS", (data) => {
      if (data.severity === 'high') {
        setIncomingPatients(prev => {
           if (prev.find(p => p.id === data.id)) return prev;
           return [data, ...prev];
        });
        playAlarm();
      }
    });

    socket.on("hospitalAlert", (data) => {
        setIncomingPatients(prev => {
           if (prev.find(p => p.id === data.id)) return prev;
           return [data, ...prev];
        });
        playAlarm();
    });

    return () => {
      socket.off("newSOS");
      socket.off("hospitalAlert");
    };
  }, []);

  const playAlarm = () => {
    const audio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    audio.play().catch(() => {});
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Hospital Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-10 rounded-[3rem] mb-10 shadow-2xl relative overflow-hidden border border-emerald-400/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-5 mb-3">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-xl border border-white/10">
                  <span className="text-3xl">🏥</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">{hospitalInfo?.name || "Emergency Medical Unit"}</h1>
              </div>
              <div className="flex flex-wrap gap-6 text-emerald-100 text-xs font-black uppercase tracking-widest ml-1 opacity-80">
                <span className="flex items-center gap-2">📍 {hospitalInfo?.lat.toFixed(4)}, {hospitalInfo?.lng.toFixed(4)}</span>
                <span className="flex items-center gap-2">🛏️ {hospitalInfo?.bedsAvailable || 0} Beds Available</span>
                <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Level 1 Trauma Facility</span>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex flex-col items-center min-w-[200px] shadow-2xl">
              <span className="text-[10px] text-emerald-300 font-black uppercase tracking-[0.3em] mb-2">ER READINESS</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">OPERATIONAL</span>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <span className="text-[10px] font-mono font-bold tracking-widest opacity-60">LIVE NETWORK SYNC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Incoming Queue */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 italic flex items-center gap-4">
                Incoming Trauma Queue
                <span className="h-0.5 w-12 bg-red-500/30" />
              </h2>
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-1 rounded-full flex items-center gap-2">
                <span className="text-red-500 text-xs font-black italic tracking-tighter">{incomingPatients.filter(p => p.status !== 'resolved').length} Active Cases</span>
              </div>
            </div>
            
            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {incomingPatients.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-20 text-center border-dashed border-white/5 shadow-2xl"
                  >
                    <div className="text-5xl mb-6 opacity-20">🚑</div>
                    <p className="font-black uppercase tracking-[0.2em] text-slate-500 text-xs">Awaiting Emergency Signals</p>
                    <p className="text-[10px] text-slate-700 mt-2 font-bold uppercase tracking-widest tracking-widest">Standby Mode Active</p>
                  </motion.div>
                ) : (
                  incomingPatients.map((patient, i) => (
                    <motion.div
                      key={patient.id || i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="glass-card p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all border-white/5"
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        patient.severity === 'high' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                      }`} />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        <div className="flex gap-6">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-2xl ${
                            patient.severity === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                          }`}>
                            {patient.severity === 'high' ? '🆘' : '🚑'}
                          </div>
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-black text-xl italic tracking-tighter uppercase">Case #{patient.id?.toString().slice(-4) || 'MOCK'}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest ${
                                patient.severity === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-orange-500 text-white shadow-lg shadow-orange-900/20'
                              }`}>
                                {patient.severity} Priority
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">
                              <p><span className="text-emerald-500 font-black italic">ETA:</span> <span className="text-white text-sm">~4 MIN</span></p>
                              <p><span className="text-slate-400 italic">Vitals:</span> <span className="text-white text-sm tracking-tight">UNSTABLE / CRITICAL</span></p>
                              <p><span className="text-slate-400 italic">Distance:</span> <span className="text-white text-sm">1.8 KM</span></p>
                              <p><span className="text-slate-400 italic">Signal:</span> <span className="text-white text-sm font-mono tracking-tighter">{new Date(patient.time).toLocaleTimeString()}</span></p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col gap-3">
                          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest active:scale-[0.98]">
                            Prepare OT 7
                          </button>
                          <button 
                            onClick={() => setIncomingPatients(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-600 hover:text-slate-400 text-[10px] font-black py-2 px-6 border border-white/5 rounded-xl uppercase tracking-widest transition-colors"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar - Analytics */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 shadow-2xl border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 border-b border-white/5 pb-4">Resource Management</h3>
              <div className="space-y-4">
                {[
                  { label: "Active Operating Theaters", val: "3 / 5", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "On-Call Trauma Surgeons", val: "04", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Blood Supply (O-)", val: "14 Units", color: "text-red-500", bg: "bg-red-500/10" },
                  { label: "Med-Vac Units", val: "02 Ready", color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-slate-900/50 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-sm font-black italic tracking-tighter ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 border-emerald-500/10 relative overflow-hidden shadow-2xl group transition-all hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-emerald-500/20 text-emerald-500">
                  🛡️
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Certified Facility</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic relative z-10">
                "Real-time pre-arrival notifications via the RoadSoS network reduce emergency processing times by an average of 18 minutes."
              </p>
              <div className="mt-8 flex justify-between items-center relative z-10 border-t border-white/5 pt-6">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Network Health</span>
                <span className="text-[10px] font-black text-emerald-500 italic uppercase">Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
