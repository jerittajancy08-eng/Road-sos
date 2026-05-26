import { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, Navigation, Clock } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [filter, setFilter] = useState('ALL'); // ALL, HIGH, MEDIUM, LOW

  const [incidents] = useState([
    { id: 'SOS-8821', time: '14:32:00', location: 'NH-48, Sector 12', severity: 'HIGH', status: 'RESPONDING' },
    { id: 'SOS-8199', time: '13:45:22', location: 'City Center Mall', severity: 'LOW', status: 'RESOLVED' },
    { id: 'SOS-7734', time: '12:10:05', location: 'Ring Road Crossing', severity: 'MEDIUM', status: 'RESOLVED' }
  ]);
  
  const [expandedId, setExpandedId] = useState(null);

  const filteredIncidents = incidents.filter(inc => filter === 'ALL' || inc.severity === filter);

  return (
    <div className="p-4 pt-8 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Command Center</h1>
          <p className="text-xs text-gray-400">Police & Medical Dispatch Timeline</p>
        </div>
        <div className="flex items-center gap-2 glass-panel px-3 py-1 border-neon-green/30">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_#00FF66]"></div>
          <span className="text-[10px] uppercase font-mono text-neon-green font-bold tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
         {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                filter === f 
                  ? 'bg-white/20 text-white border-white/30 shadow-lg' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'
              }`}
            >
              {f} Impact
            </button>
         ))}
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar pb-10">
        <AnimatePresence>
          {filteredIncidents.map((incident) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={incident.id} 
              className={`glass-card p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
                incident.status === 'RESPONDING' 
                  ? 'border-neon-red/50 bg-red-900/10 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                  : 'border-white/5'
              }`}
              onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                  <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded shadow-sm">
                    {incident.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><Clock size={10}/> {incident.time}</span>
                </div>
                <SeverityBadge severity={incident.severity} />
              </div>
              
              <h3 className="text-base text-white font-semibold mb-4 leading-tight">{incident.location}</h3>

              {/* Collapsed Status View */}
              {expandedId !== incident.id && (
                 <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                   <span className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1
                     ${incident.status === 'RESPONDING' ? 'text-neon-red animate-pulse' : 'text-neon-green'}`}
                   >
                     {incident.status === 'RESPONDING' ? <Activity size={12}/> : <CheckCircle size={12}/> }
                     {incident.status}
                   </span>
                   <span className="text-[10px] text-gray-500 font-bold hover:text-white transition">Show Timeline ▾</span>
                 </div>
              )}

              {/* Expanded Timeline View */}
              <AnimatePresence>
                {expandedId === incident.id && (
                  <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="mt-4 pt-4 border-t border-white/10"
                  >
                     <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-4">Response Timeline</p>
                     
                     <div className="relative border-l-2 border-white/10 ml-3 space-y-4 pb-2 mt-4">
                        {/* Dot 1 */}
                        <div className="relative pl-6">
                           <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_#DC2626]"></div>
                           <p className="text-[11px] font-mono text-gray-400">14:32:00</p>
                           <p className="text-sm font-bold text-red-500">Crash detected (High Impact)</p>
                        </div>
                        {/* Dot 2 */}
                        <div className="relative pl-6">
                           <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-400"></div>
                           <p className="text-[11px] font-mono text-gray-400">14:32:05</p>
                           <p className="text-sm font-bold text-white">SOS Auto-Triggered</p>
                        </div>
                        {/* Dot 3 */}
                        <div className="relative pl-6">
                           <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-neon-blue shadow-[0_0_10px_#00F0FF]"></div>
                           <p className="text-[11px] font-mono text-gray-400">14:32:08</p>
                           <p className="text-sm font-bold text-white">Hospital Notified: Patient Data Sent</p>
                        </div>
                        {/* Dot 4 */}
                        <div className="relative pl-6">
                           <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-neon-blue"></div>
                           <p className="text-[11px] font-mono text-gray-400">14:32:10</p>
                           <p className="text-sm font-bold text-white flex items-center gap-1">Ambulance dispatched <Navigation size={12} className="text-neon-blue"/></p>
                        </div>
                        {/* Dot 5 */}
                        <div className="relative pl-6">
                           <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${incident.status === 'RESOLVED' ? 'bg-neon-green shadow-[0_0_10px_#00FF66]' : 'bg-gray-600 animate-pulse'}`}></div>
                           <p className="text-[11px] font-mono text-gray-400">14:33:00</p>
                           <p className={`text-sm font-bold ${incident.status === 'RESOLVED' ? 'text-neon-green' : 'text-gray-400'}`}>Helpers arrived at scene</p>
                        </div>
                     </div>

                     <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-start gap-2">
                        <ShieldAlert size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                        <p className="text-gray-300 text-[10px] leading-relaxed font-medium">Police notified. Location mapping synchronized with Sector 12 CCTV grid for impact intelligence.</p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
