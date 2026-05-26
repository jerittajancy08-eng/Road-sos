import React, { useState, useEffect } from "react";
import { socket } from "./hooks/useSocket";
import Login from "./login";
import HelperDashboard from "./components/HelperDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import UserDashboard from "./components/UserDashboard";
import SplashScreen from "./components/SplashScreen";
import "./index.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [requests, setRequests] = useState([]);
  const [isSplashActive, setIsSplashActive] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    fetch("http://localhost:5000/sos")
      .then(res => res.json())
      .then(setRequests)
      .catch(err => console.error("Error fetching SOS:", err));

    socket.on("newSOS", (data) => {
      setRequests((prev) => {
         if (prev.find(r => r.id === data.id)) return prev;
         return [data, ...prev];
      });
    });

    socket.on("statusUpdated", (data) => {
      setRequests((prev) => 
        prev.map(r => r.id === data.sosId ? { ...r, status: data.status } : r)
      );
    });

    socket.on("helperUpdate", (data) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === data.sosId ? { ...r, helpers: data.helpers } : r))
      );
    });

    return () => {
      socket.off("newSOS");
      socket.off("statusUpdated");
      socket.off("helperUpdate");
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (isSplashActive) {
    return <SplashScreen onComplete={() => setIsSplashActive(false)} />;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-red-500/30">
      <main className="pb-24">
        {user.role === "helper" && <HelperDashboard requests={requests} />}
        {user.role === "hospital" && <HospitalDashboard requests={requests} />}
        {user.role === "police" && <PoliceDashboard requests={requests} />}
        {user.role === "user" && <UserDashboard user={user} />}
      </main>
      
      {/* Global Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center z-[4000] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network Connected</span>
           </div>
           <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
             <span>Protocol: RoadSOS v2.4</span>
             <span>Region: Sector 7-G</span>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right mr-4 hidden md:block">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Active Session</div>
              <div className="text-[10px] font-black text-white italic tracking-tight">{user.name} ({user.role.toUpperCase()})</div>
           </div>
           <button 
            onClick={handleLogout}
            className="bg-white/5 hover:bg-red-600/10 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-500 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all active:scale-95"
          >
            TERMINATE
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;