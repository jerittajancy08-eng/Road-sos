import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { socket } from "../hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

const serviceIcon = (type) => new L.Icon({
  iconUrl: type === 'hospital' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png' : 
           type === 'police' ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png' :
           'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function UserDashboard({ user }) {
  const [services, setServices] = useState([]);
  const [myLocation, setMyLocation] = useState([13.0827, 80.2707]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [roadAlert, setRoadAlert] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setMyLocation([pos.coords.latitude, pos.coords.longitude]);
    }, () => {
      // Fallback if geo blocked
    });

    fetch("http://localhost:5000/data/services.json")
      .then(res => res.json())
      .then(setServices)
      .catch(err => console.error("Error fetching services:", err));

    socket.on("newSOS", (data) => {
      const dist = Math.sqrt((data.lat - myLocation[0])**2 + (data.lng - myLocation[1])**2) * 111;
      if (dist < 2 && data.user !== user?.name) {
        setRoadAlert(`Caution: Accident detected ${dist.toFixed(1)}km away. Drive carefully.`);
        setTimeout(() => setRoadAlert(null), 10000);
      }
    });

    return () => socket.off("newSOS");
  }, [myLocation, user?.name]);

  const startSOSFlow = () => {
    setShowConfirm(true);
    setCountdown(10);
  };

  useEffect(() => {
    let timer;
    if (showConfirm && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showConfirm && countdown === 0) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [showConfirm, countdown]);

  const triggerSOS = () => {
    setIsSOSActive(true);
    setShowConfirm(false);
    
    const payload = {
      id: Date.now(),
      lat: myLocation[0],
      lng: myLocation[1],
      severity: "high",
      user: user?.name || "User",
      time: Date.now(),
      status: "pending",
      helpers: []
    };

    socket.emit("sendRequest", payload);
    
    const audio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    audio.play().catch(() => {});
  };

  const cancelSOS = () => {
    setShowConfirm(false);
    setCountdown(10);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-red-500">ROADSOS</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Emergency Response Node</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/50 border border-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black tracking-widest text-slate-300">SYSTEM ARMED</span>
          </div>
        </header>

        {/* Road Alert Banner */}
        <AnimatePresence>
          {roadAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-orange-500/90 backdrop-blur-md text-white p-5 rounded-[2rem] mb-8 flex items-center gap-5 shadow-2xl shadow-orange-950/20 border border-orange-400/30"
            >
              <div className="bg-white/20 p-3 rounded-2xl text-2xl">⚠️</div>
              <p className="text-sm font-black leading-tight tracking-tight">{roadAlert}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Map & SOS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card h-[400px] overflow-hidden relative shadow-2xl">
              <MapContainer center={myLocation} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={myLocation} />
                {services.map(s => (
                  <Marker key={s.id} position={[s.lat, s.lng]} icon={serviceIcon(s.type)}>
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{s.type}</p>
                        <p className="font-bold text-sm">{s.name}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400 shadow-xl">
                COORDS: {myLocation[0].toFixed(5)}, {myLocation[1].toFixed(5)}
              </div>
            </div>

            <div className="glass-card p-10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {!isSOSActive ? (
                  <motion.button
                    key="sos-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startSOSFlow}
                    className="w-56 h-56 bg-gradient-to-br from-red-500 to-red-800 rounded-full shadow-[0_0_60px_rgba(239,68,68,0.3)] flex flex-col items-center justify-center border-[12px] border-red-500/10 relative group"
                  >
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-10 group-hover:opacity-20 transition-opacity" />
                    <span className="text-5xl mb-2 drop-shadow-lg">🆘</span>
                    <span className="text-3xl font-black tracking-tighter drop-shadow-md">SOS</span>
                    <span className="text-[10px] font-black tracking-widest opacity-60 mt-1 uppercase">Trigger</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="sos-active"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-56 h-56 rounded-full bg-red-500/10 flex items-center justify-center border-4 border-red-500 border-dashed animate-spin-slow mb-8">
                       <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                          <span className="text-2xl">📡</span>
                       </div>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Emergency Signal Sent</h3>
                    <p className="text-slate-500 text-sm mt-3 font-medium max-w-xs">We've notified the nearest police unit, hospital, and {Math.floor(Math.random()*10)+5} nearby helpers.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Contacts & Resources */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Hotline Shortcuts</h3>
              <div className="space-y-4">
                {[
                  { name: "Police Emergency", num: "100 / 112", color: "from-blue-600 to-blue-800", icon: "👮" },
                  { name: "Ambulance / Medical", num: "102 / 108", color: "from-emerald-600 to-emerald-800", icon: "🚑" },
                  { name: "Fire Department", num: "101", color: "from-orange-600 to-orange-800", icon: "🔥" }
                ].map((item, i) => (
                  <motion.button 
                    key={i}
                    whileHover={{ x: 5 }}
                    className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/5 p-5 rounded-3xl flex items-center gap-5 transition-all group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">{item.num}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-50" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 relative z-10">Golden Hour Alert</h3>
              <p className="text-sm font-bold text-white leading-relaxed relative z-10">
                Medical assistance within the first 60 minutes increases survival rate by 80%. Stay calm, help is coming.
              </p>
              <div className="mt-6 flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">🛡️</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[2000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="glass-card p-12 max-w-sm w-full text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/20"
            >
              <div className="w-28 h-28 rounded-full border-8 border-red-500/20 flex items-center justify-center mx-auto mb-8 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-red-500"
                    strokeDasharray={301.59}
                    strokeDashoffset={301.59 * (1 - countdown / 10)}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="text-4xl font-black italic">{countdown}</span>
              </div>
              
              <h2 className="text-3xl font-black mb-3 tracking-tighter">Are you safe?</h2>
              <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">
                If you don't respond, an emergency broadcast will initiate automatically in {countdown} seconds.
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={cancelSOS}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest text-xs"
                >
                  I AM SAFE, CANCEL
                </button>
                <button 
                  onClick={triggerSOS}
                  className="text-slate-500 hover:text-white font-black text-[10px] py-2 uppercase tracking-[0.2em] transition-colors"
                >
                  Send Immediately
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}