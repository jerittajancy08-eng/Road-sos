import { useEmergencyContext } from '../hooks/EmergencyContext';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function ActivityScreen() {
  const { activityLog, activeEmergency, emergencyStatus } = useEmergencyContext();

  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-xs text-slate-400 mt-1">Live incident timeline and event history</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-300 uppercase tracking-[0.35em] font-semibold">
          {activeEmergency ? emergencyStatus : 'Idle'}
        </span>
      </div>

      <div className="space-y-3">
        {activityLog.length > 0 ? (
          activityLog.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{entry.subtitle}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-300 uppercase tracking-[0.25em]">
                  {entry.severity || 'INFO'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[28px] bg-slate-950/85 px-4 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl text-center text-slate-300">
            <Activity className="mx-auto mb-3 h-6 w-6 text-cyan-300" />
            <p className="text-sm font-semibold text-white">Ready for action</p>
            <p className="text-xs mt-2">When the network detects an event, it will show up here instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
