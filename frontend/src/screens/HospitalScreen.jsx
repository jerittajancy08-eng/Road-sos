import { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle, Navigation, Activity, Clock } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useEmergencyContext } from '../hooks/EmergencyContext';

export default function HospitalScreen() {
  const { eta, activeEmergency } = useEmergencyContext();
  const [prepProgress, setPrepProgress] = useState(0);
  const [bedStatus, setBedStatus] = useState('Available');

  useEffect(() => {
    if (!activeEmergency) {
       setPrepProgress(0);
       setBedStatus('Available');
       return;
    }

    // Simulate progress bar based on active emergency
    const progTimer = setInterval(() => {
       setPrepProgress(p => p < 100 ? p + 2 : p);
    }, 50);

    // Dynamic bed update simulation
    const bedTimer = setTimeout(() => {
       setBedStatus('Reserved');
    }, 4500);

    return () => { clearInterval(progTimer); clearTimeout(bedTimer); };
  }, [activeEmergency]);

  const isReady = prepProgress >= 100;
  const [profile] = useProfile();

  return (
    <div className="p-4 pt-8 pb-20 fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Smart Match AI</h1>
      <p className="text-gray-400 text-xs mb-6">Routing to optimal trauma center based on crash vectors and real-time medical facility readiness.</p>
      
      {/* Recommended Hospital Card */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className={`glass-panel p-6 relative overflow-hidden mb-6 transition-all duration-500 
           ${isReady ? 'border-neon-green shadow-[0_0_20px_rgba(0,255,102,0.15)] bg-[#00FF66]/5' : 'border-neon-blue/40 shadow-[0_0_20px_rgba(0,240,255,0.1)]'}`}
      >
        <div className="absolute top-0 right-0 py-2 px-3 bg-white/5 rounded-bl-xl border-l border-b border-white/10">
           <span className="text-[10px] uppercase font-bold text-gray-400">ETA</span>
           <div className="text-lg font-mono font-bold text-neon-blue leading-none">
             {Math.floor(eta / 60)}:{(eta % 60).toString().padStart(2, '0')}
           </div>
        </div>

        <div className="mb-4">
           <span className="bg-neon-blue/20 text-neon-blue border border-neon-blue/40 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(0,240,255,0.3)]">
             ★ Best Match
           </span>
        </div>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex flex-col items-center justify-center border border-neon-blue/30">
            <Stethoscope className="text-neon-blue w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">City Care Hospital</h2>
            <p className="text-xs text-gray-400 mt-0.5">Level 1 Trauma Center • Multi-speciality</p>
          </div>
        </div>

        <div className="space-y-4 relative z-10 w-full mb-6">
           <p className="text-[10px] text-gray-500 font-mono flex justify-between">
              <span>{isReady ? 'Emergency Ward Prepared' : 'Preparing Emergency Response...'}</span>
              <span>{prepProgress}%</span>
           </p>
           <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                 className={`h-full transition-all ${isReady ? 'bg-neon-green' : 'bg-neon-blue'}`}
                 style={{ width: `${prepProgress}%` }}
              />
           </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-2">
             <div className="glass-card p-3 text-center border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Trauma Bed</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={bedStatus}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`block text-sm font-bold uppercase tracking-wider ${bedStatus === 'Reserved' ? 'text-neon-green' : 'text-neon-blue animate-pulse'}`}
                  >
                     {bedStatus === 'Reserved' ? 'RESERVED' : 'Allocating...'}
                  </motion.span>
                </AnimatePresence>
             </div>
             <div className="glass-card p-3 text-center border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ambulance</span>
                <span className="block text-sm font-bold text-neon-blue mt-1 uppercase flex gap-1 justify-center items-center"><Activity size={12}/> Dispatched</span>
             </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-gray-300">Patient Data Transmitted 📡</span>
              <SeverityBadge severity="HIGH" />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <div className="text-[10px]"><span className="text-gray-500 block">Est. Impact Force:</span><span className="text-white font-mono">14 Gs / Frontal</span></div>
              <div className="text-[10px]"><span className="text-gray-500 block">Patient Name:</span><span className="text-neon-blue font-mono">{profile.name} ({profile.age}y)</span></div>
              <div className="text-[10px]"><span className="text-gray-500 block">Blood Group:</span><span className="text-red-400 font-mono font-bold">{profile.bloodGroup}</span></div>
              <div className="text-[10px]"><span className="text-gray-500 block">Allergies:</span><span className="text-red-300 font-mono">{profile.allergies || 'None'}</span></div>
              <div className="text-[10px] col-span-2 mt-1 px-2 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded"><span className="text-yellow-500 uppercase font-bold tracking-widest block mb-0.5">Emergency Contact Pinged</span><span className="text-gray-300 font-mono">{profile.emergencyContactName} ({profile.emergencyContactPhone})</span></div>
            </div>
            
            <div className="mt-3 text-center border-t border-white/10 pt-3">
              <p className="text-[10px] text-gray-400 italic">"Critical profile data received instantly, saving ~12 minutes of blood typing and allergy checks during the Golden Hour."</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
           {isReady && (
              <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-5 pt-4 border-t border-neon-green/30 flex items-center gap-3"
              >
                  <div className="w-8 h-8 rounded-full bg-neon-green/20 flex flex-col items-center justify-center border border-neon-green shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                    <CheckCircle size={16} className="text-neon-green" />
                  </div>
                  <div className="text-white">
                    <span className="block font-bold pl-1 text-sm tracking-wide text-neon-green">Readiness Confirmed</span>
                    <span className="block text-[10px] pl-1 text-gray-300">Surgical suite standby. Dr. Sharma notified.</span>
                  </div>
              </motion.div>
           )}
        </AnimatePresence>
      </motion.div>

      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Nearby Alternatives / Clinics</h3>
      <div className="glass-card p-4 flex justify-between items-center opacity-80 border-l-4 border-l-yellow-500 border-white/5 hover:opacity-100">
        <div>
          <h4 className="text-white font-semibold flex items-center gap-2 text-sm">Green Valley Clinic</h4>
          <p className="text-[10px] text-gray-400 mt-1">4.1 km &bull; General Ward &bull; 15m ETA</p>
        </div>
        <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition text-white">
          Reroute
        </button>
      </div>
    </div>
  );
}
