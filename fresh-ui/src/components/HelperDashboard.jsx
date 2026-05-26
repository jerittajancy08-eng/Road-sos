import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function HelperDashboard({ requests: initialRequests }) {
  const [requests, setRequests] = useState(initialRequests || []);
  const [acceptedRequests, setAcceptedRequests] = useState(new Set());

  useEffect(() => {
    socket.on("newSOS", (data) => {
      setRequests((prev) => {
        if (prev.find(r => r.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    socket.on("helperUpdate", (data) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === data.sosId ? { ...r, helpers: data.helpers } : r))
      );
    });

    return () => {
      socket.off("newSOS");
      socket.off("helperUpdate");
    };
  }, []);

  const handleAccept = (sosId) => {
    const helper = {
      helperId: "helper_" + Math.floor(Math.random() * 1000),
      name: "Nearby Responder",
      contact: "+91 98765 43210",
    };
    socket.emit("helperAccepted", { sosId, helper });
    setAcceptedRequests((prev) => new Set(prev).add(sosId));
  };

  const calculateDistance = (lat, lng) => {
    return (Math.random() * 5 + 0.5).toFixed(1);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-red-500 flex items-center gap-3 italic">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></span>
              </span>
              HELPER COMMAND
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Community Rescue Network</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Status:</span> 
            <span className="text-emerald-400 text-xs font-black uppercase tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Ready to Respond
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Map Section */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="glass-card h-[450px] overflow-hidden shadow-2xl relative mb-8">
              <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {requests.map((req) => (
                  <Marker key={req.id} position={[req.lat, req.lng]} icon={accidentIcon}>
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[120px]">
                        <p className="text-[10px] font-black text-red-500 uppercase mb-1">Incident Report</p>
                        <p className="text-xs font-bold mb-3">Severity: {req.severity.toUpperCase()}</p>
                        <button 
                          onClick={() => handleAccept(req.id)}
                          className="w-full bg-red-600 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest transition-all hover:bg-red-500"
                        >
                          Respond
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="absolute top-6 left-6 z-[1000] bg-slate-950/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-slate-300">SCANNING 5KM RADIUS</span>
              </div>
            </div>

            {/* Notification/Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Golden Hour", val: "Critical", icon: "⏱️", color: "text-red-500" },
                { label: "Community", val: "1.2k Active", icon: "👥", color: "text-blue-500" },
                { label: "Avg Response", val: "4.2 Min", icon: "⚡", color: "text-emerald-500" }
              ].map((s, i) => (
                <div key={i} className="glass-card p-6 flex flex-col items-center text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                  <div className={`text-lg font-black ${s.color} italic tracking-tight`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Live Alert Feed</h2>
              <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-full border border-red-500/20">
                {requests.filter(r => r.status === 'pending').length} New
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {requests.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center border-dashed border-white/5"
                  >
                    <div className="text-4xl mb-4 opacity-20">📡</div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Waiting for signals...</p>
                  </motion.div>
                ) : (
                  requests.map((req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`glass-card p-6 transition-all group ${
                        acceptedRequests.has(req.id) 
                          ? 'border-emerald-500/50 bg-emerald-500/5' 
                          : 'hover:border-red-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            req.severity === 'high' ? 'bg-red-500 animate-pulse' : 
                            req.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Alert #{req.id.toString().slice(-4)}</div>
                            <div className="text-sm font-black tracking-tight">Accident Detected</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                          req.severity === 'high' ? 'bg-red-500 text-white' : 
                          req.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {req.severity}
                        </span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Distance</span>
                          <span className="text-white">{calculateDistance(req.lat, req.lng)} KM</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Estimated ETA</span>
                          <span className="text-red-400 font-black">~{Math.ceil(calculateDistance(req.lat, req.lng) * 2)} MIN</span>
                        </div>
                      </div>

                      {!acceptedRequests.has(req.id) ? (
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="w-full bg-slate-800 hover:bg-red-600 text-white text-[10px] font-black py-3.5 rounded-xl transition-all uppercase tracking-widest shadow-lg active:scale-[0.98]"
                        >
                          Accept & Navigate
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-3 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                          Mission Active
                        </div>
                      )}

                      {req.helpers && req.helpers.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-3">
                            {req.helpers.slice(0, 4).map((h, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-blue-400 uppercase">
                                {h.name[0]}
                              </div>
                            ))}
                          </div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {req.helpers.length} Team Members
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}