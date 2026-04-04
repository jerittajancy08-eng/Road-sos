import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, ShieldAlert, Stethoscope, LayoutDashboard, MapPin, Activity, User } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';
import ServicesScreen from './screens/ServicesScreen';
import HospitalScreen from './screens/HospitalScreen';
import AdminDashboard from './screens/AdminDashboard';
import LiveTrackingScreen from './screens/LiveTrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useState, useEffect } from 'react';
import { EmergencyProvider } from './hooks/EmergencyContext';
import SystemStatusBar from './components/SystemStatusBar';

function BottomNav() {
  const location = useLocation();
  // Hide nav on tracking screen
  if (location.pathname === '/tracking') return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-dark-panel/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center p-3">
        <Link to="/" className={`flex flex-col items-center transition-colors ${location.pathname==='/' ? 'text-neon-red' : 'text-gray-400 hover:text-white'}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-bold">SOS</span>
        </Link>
        <Link to="/services" className={`flex flex-col items-center transition-colors ${location.pathname==='/services' ? 'text-neon-yellow' : 'text-gray-400 hover:text-white'}`}>
          <MapPin size={24} />
          <span className="text-[10px] mt-1 font-bold">Nearby</span>
        </Link>
        <Link to="/hospital" className={`flex flex-col items-center transition-colors ${location.pathname==='/hospital' ? 'text-neon-blue' : 'text-gray-400 hover:text-white'}`}>
          <Stethoscope size={22} />
          <span className="text-[9px] mt-1 font-bold">Hospitals</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center transition-colors ${location.pathname==='/profile' ? 'text-white drop-shadow-[0_0_10px_#FFF]' : 'text-gray-400 hover:text-white'}`}>
          <User size={22} />
          <span className="text-[9px] mt-1 font-bold">Profile</span>
        </Link>
        <Link to="/admin" className={`flex flex-col items-center transition-colors ${location.pathname==='/admin' ? 'text-neon-green' : 'text-gray-400 hover:text-white'}`}>
          <LayoutDashboard size={22} />
          <span className="text-[9px] mt-1 font-bold">Admin</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <EmergencyProvider>
      <Router>
        <div className="flex flex-col h-screen min-h-screen relative max-w-md mx-auto bg-dark-bg selection:bg-neon-red/30">
          
          <SystemStatusBar />

          {/* Network Indicator */}
          <div className={`absolute top-0 w-full z-[1000] text-xs font-bold py-1 text-center shadow-lg transition-colors flex justify-center items-center gap-2 ${
              isOffline 
                ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]' 
                : 'bg-black/80 backdrop-blur text-neon-green border-b border-neon-green/30'
            }`}
          >
            {isOffline ? (
               <>⚠️ Offline Mode Active - SMS Fallback Armed</>
            ) : (
               <><div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></div> Online - Live Sync Active</>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full h-full pb-20">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/services" element={<ServicesScreen />} />
              <Route path="/hospital" element={<HospitalScreen />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/tracking" element={<LiveTrackingScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
          </div>

          <BottomNav />
        </div>
      </Router>
    </EmergencyProvider>
  );
}

export default App;
