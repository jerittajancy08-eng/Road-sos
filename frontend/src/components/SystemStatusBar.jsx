import { useEmergencyContext } from '../hooks/EmergencyContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemStatusBar() {
  const { activeEmergency, phase } = useEmergencyContext();

  const getStatusMessage = () => {
    switch(phase) {
       case 'INITIATED': return "🚨 HIGH IMPACT DETECTED | Analyzing Coordinates...";
       case 'DISPATCHED': return "🚨 SEVERITY: HIGH | 🚓 Police Notified | 🏥 Hospital Syncing...";
       case 'RESPONDING': return "🚨 SEVERITY: HIGH | 🚑 Ambulance En Route | 🧑‍🤝‍🧑 Network Active";
       default: return "";
    }
  };

  return (
    <AnimatePresence>
      {activeEmergency && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[2000] w-full bg-red-600 border-b border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          <div className="flex items-center justify-center py-1.5 px-2 overflow-hidden whitespace-nowrap">
            <motion.p 
               key={phase}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2"
            >
               <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
               {getStatusMessage()}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
