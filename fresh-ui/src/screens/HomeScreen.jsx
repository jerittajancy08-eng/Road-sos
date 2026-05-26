import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import SOSButton from '../components/SOSButton';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyContext } from '../hooks/EmergencyContext';
import { useProfile } from '../hooks/useProfile';

const userIcon = L.divIcon({
  className: 'bg-transparent map-user-beacon',
  html: `<div class="w-4 h-4 bg-neon-blue rounded-full shadow-[0_0_15px_#00F0FF] border-2 border-white relative z-10"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const getServiceIcon = (category) => {
  let color = '#FFF';
  if (category === 'hospital') color = '#FF3366'; // Red for hospital
  if (category === 'police') color = '#00F0FF';  // Blue for police
  if (category === 'towing') color = '#FFD700';  // Yellow for towing

  return L.divIcon({
    className: 'bg-transparent flex justify-center items-center',
    html: `<div class="w-3 h-3 rounded-full border border-white/50 shadow-lg" style="background-color: ${color}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

export default function HomeScreen() {
  const { userPos, setUserPos, triggerGlobalEmergency } = useEmergencyContext();
  const [sosStatus, setSosStatus] = useState('IDLE'); // IDLE, PROCESSING, SMS_SENT
  const [processStep, setProcessStep] = useState(0);
  const [services, setServices] = useState([]);
  
  const [speed, setSpeed] = useState(65);
  const [impact, setImpact] = useState('Normal');

  const navigate = useNavigate();
  const [profile] = useProfile(); // For SMS fall-back data

  useEffect(() => {
    // Acquire native Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geolocation blocked, using default fallback.")
      );
    }
    fetch('http://localhost:5000/api/nearby-services')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const allServices = [
            ...data.data.hospitals,
            ...data.data.police,
            ...data.data.towing
          ];
          setServices(allServices);
        }
      })
      .catch(e => console.error("Could not load markers:", e));
  }, []);

  const simulateAccident = () => {
    setSpeed(0);
    setImpact('HIGH (Simulated Crash)');
    handleSOSConfirm();
  };

  const loadingSequence = [
    "Detecting crash...",
    "Analyzing impact...",
    "Contacting emergency services...",
    "Notifying nearby responders..."
  ];

  const handleSOSConfirm = () => {
    if (sosStatus !== 'IDLE') return;
    setSosStatus('PROCESSING');
    setProcessStep(0);
    
    // Sequential Loader Logic
    const advanceStep = (step) => {
       if (step < loadingSequence.length) {
         setProcessStep(step);
         setTimeout(() => advanceStep(step + 1), navigator.onLine ? 1200 : 600);
       } else {
         executeSOS();
       }
    };
    advanceStep(0);
  };

  const executeSOS = async () => {
    if (!navigator.onLine) {
        // SMS Fallback Logic
        triggerGlobalEmergency(userPos[0], userPos[1]);
        setSosStatus('SMS_SENT');
        setTimeout(() => navigate('/tracking'), 4000);
        return;
    }

    triggerGlobalEmergency(userPos[0], userPos[1]);
    try {
      await fetch('http://localhost:5000/api/trigger-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: userPos,
          severity: 'HIGH',
          timestamp: new Date().toISOString()
        })
      });
      navigate('/tracking');
    } catch (e) {
       console.error(e);
       navigate('/tracking'); // go anyway for demo
    }
  };

  return (
    <div className="relative h-full flex flex-col pt-3">
      {/* Live Sensor Monitoring UI */}
      <div className="absolute top-4 left-4 right-4 z-[400] glass-panel px-4 py-3 flex justify-between items-center border border-white/20">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${impact === 'Normal' ? 'bg-neon-green animate-pulse' : 'bg-neon-red animate-pulse'}`}></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white">Monitoring: Active</span>
        </div>
        <div className="flex gap-4 text-xs font-mono">
           <div className="flex flex-col"><span className="text-gray-400">SPEED</span> <span className={`${speed === 0 ? 'text-neon-red font-bold' : 'text-neon-blue'}`}>{speed} km/h</span></div>
           <div className="flex flex-col"><span className="text-gray-400">IMPACT</span> <span className={`${impact !== 'Normal' ? 'text-neon-red font-bold' : 'text-white'}`}>{impact}</span></div>
        </div>
      </div>

      <div className="h-[60%] w-full relative pt-[70px]">
        <MapContainer 
          center={userPos} 
          zoom={14} 
          zoomControl={false}
          className="h-full w-full rounded-b-3xl shadow-xl"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={userPos} icon={userIcon}>
             <Popup>Your Location</Popup>
          </Marker>
          <Circle 
            center={userPos} 
            radius={800} 
            pathOptions={{ color: '#00F0FF', fillColor: '#00F0FF', fillOpacity: 0.1, weight: 1, className: "animate-pulse" }} 
          />

          {services.map((service, idx) => (
             <Marker key={idx} position={[service.lat, service.lng]} icon={getServiceIcon(service.category)}>
                <Popup className="custom-popup bg-dark-panel p-2">
                   <div className="font-poppins">
                      <p className="font-bold text-xs">{service.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{service.type}</p>
                   </div>
                </Popup>
             </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="h-[40%] w-full bg-dark-bg z-[400] relative flex flex-col items-center justify-center pt-2 pb-10">
         <p className="text-gray-500 text-[11px] text-center px-8 mb-2 font-medium tracking-wide">
            Hold for 2 seconds to broadcast emergency signal to responders.
         </p>
         <SOSButton onTrigger={handleSOSConfirm} />
         
         <button 
           onClick={simulateAccident}
           className="absolute bottom-20 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-gray-400 font-mono hover:text-white hover:bg-white/10 transition shadow-lg"
         >
           [Simulate Frontal Crash]
         </button>
      </div>

      {/* FULL SCREEN EMERGENCY TRANSITION */}
      <AnimatePresence>
        {(sosStatus === 'PROCESSING' || sosStatus === 'SMS_SENT') && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
           >
              {sosStatus === 'PROCESSING' ? (
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ type: 'spring' }}
                   className="text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                       <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-wider mb-2 text-shadow-lg">🚨 EMERGENCY</h1>
                    <h2 className="text-xl font-bold text-red-500 tracking-widest mb-12 uppercase">DETECTED</h2>
                    
                    <div className="w-full max-w-sm bg-gray-900 rounded-full h-1.5 mb-6 overflow-hidden">
                       <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: `${((processStep + 1) / loadingSequence.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-red-500 h-1.5 rounded-full shadow-[0_0_10px_#EF4444]"
                       ></motion.div>
                    </div>

                    <motion.p 
                       key={processStep}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="text-sm text-gray-300 font-mono flex items-center justify-center gap-3"
                    >
                       <Activity size={16} className="text-red-500 animate-spin" />
                       {loadingSequence[processStep]}
                    </motion.p>
                </motion.div>
              ) : (
                /* OFFLINE SMS SIMULATOR UI */
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ type: 'spring' }}
                   className="w-full max-w-xs glass-panel p-5 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                >
                    <h3 className="text-yellow-500 font-bold mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                       <AlertTriangle size={14}/> Network Offline
                    </h3>
                    <p className="text-white font-bold text-sm mb-2">Simulating SMS Fallback Protocol</p>
                    <div className="bg-black/50 p-3 rounded text-[10px] font-mono text-gray-300 mb-4 whitespace-pre-wrap">
                      [URGENT SOS]<br/>
                      {profile.name} (Blood: {profile.bloodGroup}) is in a high-impact collision.<br/>
                      Loc: maps.google.com/?q={userPos[0]},{userPos[1]}<br/>
                      Dispatched via RoadSoS Network.
                    </div>
                    <div className="flex items-center gap-2 text-neon-green text-xs font-bold">
                       <div className="w-2 h-2 bg-neon-green rounded-full animate-ping"></div>
                       Payload sent to {profile.emergencyContactName}
                    </div>
                </motion.div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
