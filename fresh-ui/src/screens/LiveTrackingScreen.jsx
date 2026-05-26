// Removed unused empty import
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Activity, ShieldAlert, CheckCircle2, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyContext } from '../hooks/EmergencyContext';

const userIcon = L.divIcon({
  className: 'bg-transparent map-user-beacon',
  html: `<div class="w-4 h-4 bg-neon-red rounded-full shadow-[0_0_15px_#FF3366] border-2 border-white"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const getAmbulanceIcon = (pulse) => L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-5 h-5 bg-white rounded flex items-center justify-center border-2 border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.8)] ${pulse ? 'animate-bounce' : ''}"><div class="w-2 h-2 text-neon-blue font-bold">+</div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export default function LiveTrackingScreen() {
  const { userPos, ambPos, eta, helpers } = useEmergencyContext();
  const routeLine = [ambPos, userPos];

  return (
    <div className="relative h-full flex flex-col pt-3 bg-dark-bg">
      <div className="absolute top-4 left-4 right-4 z-[400] glass-panel px-4 py-3 border border-red-500/40 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.2)]">
         <div className="flex gap-3 items-center">
            <Activity className="text-red-500 animate-pulse" size={20} />
            <div>
               <h3 className="text-white font-bold text-sm leading-tight">Live Response Tracking</h3>
               <p className="text-[10px] text-gray-400 font-mono">Case ID: SOS-8821</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ETA</p>
            <p className="text-xl text-neon-blue font-mono font-bold leading-none">
              {Math.floor(eta / 60)}:{(eta % 60).toString().padStart(2, '0')}
            </p>
         </div>
      </div>

      <div className="h-[45%] w-full relative pt-16">
         <MapContainer center={userPos} zoom={14} zoomControl={false} className="h-full w-full rounded-b-3xl">
           <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
           <Marker position={userPos} icon={userIcon} />
           <Marker position={ambPos} icon={getAmbulanceIcon(eta > 0)} />
           <Polyline positions={routeLine} color="#00F0FF" weight={4} dashArray="10, 10" className="animate-pulse" />
         </MapContainer>
      </div>

      {/* Info Dashboard below */}
      <div className="h-[55%] overflow-y-auto no-scrollbar p-4 relative z-10 pb-20 space-y-4">
         
         {/* Authorities Status */}
         <div className="grid grid-cols-2 gap-3">
             <div className="glass-card p-4 border border-neon-blue/30 rounded-2xl">
                 <Navigation size={18} className="text-neon-blue mb-2" />
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ambulance</p>
                 <p className="text-sm text-white font-bold mb-1">Dispatched</p>
                 <p className="text-xs text-neon-blue font-mono">{eta > 60 ? '2 mins away' : 'Arriving now'}</p>
             </div>
             <div className="glass-card p-4 border border-neon-green/30 rounded-2xl">
                 <ShieldAlert size={18} className="text-neon-green mb-2" />
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Police</p>
                 <p className="text-sm text-white font-bold mb-1">Notified</p>
                 <p className="text-xs text-neon-green font-mono">En route</p>
             </div>
         </div>

         {/* Nearby Helpers */}
         <div>
            <div className="flex items-center justify-between mb-3 px-1">
               <div className="flex items-center gap-2">
                 <UserCircle size={14} className="text-gray-400" />
                 <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Nearby App Users</h3>
               </div>
               <span className="text-[9px] text-neon-blue font-mono">Updated 2s ago</span>
            </div>
            <div className="space-y-3">
               <AnimatePresence>
                  {helpers.map((helper) => (
                     <motion.div 
                        key={helper.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-3 rounded-xl flex items-center justify-between border ${helper.reached ? 'border-neon-green bg-green-500/10 shadow-[0_0_20px_rgba(0,255,102,0.15)]' : helper.accepted ? 'border-neon-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-white/5'}`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${helper.reached ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' : helper.accepted ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/10 text-gray-400'}`}>
                              {helper.initials}
                           </div>
                           <div>
                              <p className="text-sm text-white font-bold">{helper.name}</p>
                              <p className={`text-[10px] ${helper.reached ? 'text-neon-green font-bold' : 'text-gray-400'}`}>
                                {helper.reached ? 'Arrived to assist' : helper.distance}
                              </p>
                           </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                           {helper.reached ? <CheckCircle2 size={16} className="text-neon-green ml-auto animate-pulse" /> : helper.accepted && <Activity size={14} className="text-neon-blue ml-auto animate-pulse" />}
                           <span className={`text-[10px] font-bold uppercase tracking-wide ${helper.reached ? 'text-neon-green' : helper.accepted ? 'text-neon-blue' : 'text-gray-500'}`}>
                              {helper.status}
                           </span>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue rounded-l-xl opacity-50"></div>
               <p className="text-[11px] text-gray-300 italic pl-2">
                 "Community responders are uniquely positioned to provide CPR or secure the scene even before the ambulance arrives." 
               </p>
            </div>
         </div>

      </div>
    </div>
  );
}
