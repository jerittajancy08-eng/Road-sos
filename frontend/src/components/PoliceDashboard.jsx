import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { socket } from "../hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

const accidentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PoliceDashboard({ requests: initialRequests }) {
  const [requests, setRequests] = useState(initialRequests || []);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    updateStats(requests);

    socket.on("newSOS", (data) => {
      setRequests((prev) => {
        if (prev.find(r => r.id === data.id)) return prev;
        const updated = [data, ...prev];
        updateStats(updated);
        return updated;
      });
    });

    socket.on("statusUpdated", (data) => {
        setRequests((prev) => {
            const updated = prev.map(r => r.id === data.sosId ? { ...r, status: data.status } : r);
            updateStats(updated);
            return updated;
        });
    });

    return () => {
      socket.off("newSOS");
      socket.off("statusUpdated");
    };
  }, [requests]);

  const updateStats = (reqs) => {
    setStats({
      total: reqs.length,
      high: reqs.filter(r => r.severity === 'high').length,
      pending: reqs.filter(r => r.status === 'pending').length,
      resolved: reqs.filter(r => r.status === 'resolved').length
    });
  };

  const handleUpdateStatus = (sosId, status) => {
    socket.emit("updateStatus", { sosId, status });
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-4 italic uppercase">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-2xl shadow-blue-900/50 flex items-center justify-center">
                <span className="text-2xl not-italic">🛡️</span>
              </div>
              Police Command
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">Live Sector Monitoring • Strategic Dispatch</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 w-full xl:w-auto custom-scrollbar">
            {[
              { label: "Active Signals", val: stats.pending, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Critical Cases", val: stats.high, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { label: "Resolved Today", val: stats.resolved, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
            ].map((s, i) => (
              <div key={i} className={`${s.bg} ${s.border} border px-8 py-5 rounded-[2rem] min-w-[180px] shadow-2xl backdrop-blur-md`}>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{s.label}</div>
                <div className={`text-3xl font-black italic tracking-tighter ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
          {/* Main Map Panel */}
          <div className="lg:col-span-8 glass-card overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border-white/5">
            <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {requests.map((req) => (
                <React.Fragment key={req.id}>
                  <Marker position={[req.lat, req.lng]} icon={accidentIcon}>
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-[200px]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case #{req.id.toString().slice(-4)}</span>
                          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded italic uppercase">{req.severity}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-300 mb-4">
                          <p className="mb-1">STATUS: {req.status.toUpperCase()}</p>
                          <p>SIGNAL: {new Date(req.time).toLocaleTimeString()}</p>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => handleUpdateStatus(req.id, 'dispatching')}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg transition-all"
                          >
                            DISPATCH
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(req.id, 'resolved')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black py-2 rounded-lg transition-all"
                          >
                            CLOSE
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  {req.severity === 'high' && req.status !== 'resolved' && (
                    <Circle 
                      center={[req.lat, req.lng]} 
                      radius={800} 
                      pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1, dashArray: '5, 10' }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
            
            {/* Map Overlay HUD */}
            <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Satellite Uplink Status</div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400">SYNC ACTIVE: SECTOR 7-G</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Feed Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 glass-card border-white/5 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-300 italic">Incident Feed</h2>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse delay-75"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse delay-150"></div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {requests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm text-center">
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 opacity-20 border border-white/10">
                        <span className="text-2xl not-italic">🛰️</span>
                      </div>
                      <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Signal Detection</p>
                    </div>
                  ) : (
                    requests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-5 rounded-[1.5rem] border transition-all ${
                          req.status === 'resolved' ? 'bg-slate-900/30 border-white/5 opacity-40' : 
                          req.severity === 'high' ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-900/10' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded italic uppercase tracking-widest ${
                            req.severity === 'high' ? 'bg-red-500 text-white' : 
                            req.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {req.severity} Priority
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">
                            {new Date(req.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="text-sm font-black italic tracking-tight mb-1 text-white uppercase">Vehicle Impact Detected</div>
                        <div className="text-[10px] text-slate-500 font-mono font-bold mb-4 flex items-center gap-2">
                          <span className="text-blue-500">GPS:</span> {req.lat.toFixed(4)}N, {req.lng.toFixed(4)}E
                        </div>
                        
                        <div className="flex gap-2">
                          {req.status !== 'resolved' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'dispatching')}
                                className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest ${
                                  req.status === 'dispatching' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                              >
                                {req.status === 'dispatching' ? 'Units En Route' : 'Dispatch Units'}
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(req.id, 'resolved')}
                                className="px-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/30 rounded-xl transition-all"
                              >
                                ✓
                              </button>
                            </>
                          ) : (
                            <div className="w-full text-center text-emerald-500 text-[10px] font-black py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
                              Incident Resolved
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* System Status Banner */}
            <div className="glass-card p-6 border-white/5 shadow-2xl flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">System Load</div>
                <div className="text-xs font-black italic text-white uppercase">Nominal Operating State</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-blue-500 italic">98%</div>
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Uplink Health</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}