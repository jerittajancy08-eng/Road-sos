import { useEmergencyContext } from '../hooks/EmergencyContext';
import { AlertTriangle, ShieldCheck, ShieldOff, WifiOff } from 'lucide-react';

export default function ProtectionScreen() {
  const {
    protectionEnabled,
    toggleProtection,
    activeEmergency,
    emergencyStatus,
    helperIncomingAlerts,
    gpsError,
    isOnline,
    error,
    offlineSms,
    toast,
  } = useEmergencyContext();

  const statusLabel = offlineSms.active
    ? offlineSms.loading
      ? 'Offline SMS mode activated'
      : offlineSms.launched
      ? 'Offline SMS ready'
      : 'Offline SMS mode activated'
    : gpsError
    ? 'GPS unavailable'
    : activeEmergency
    ? emergencyStatus
    : 'Idle';

  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Protection settings</h1>
          <p className="text-xs text-slate-400 mt-1">Live monitoring for your route and alerts</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.28em] font-semibold ${activeEmergency || offlineSms.active ? 'bg-red-500/15 text-red-200 emergency-pulse' : 'bg-cyan-500/10 text-cyan-300'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-4">
        {(gpsError || error || !isOnline || toast || offlineSms.active) && (
          <div className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-red-500/20 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              {!isOnline ? <WifiOff className="mt-1 h-5 w-5 text-amber-300" /> : <AlertTriangle className="mt-1 h-5 w-5 text-red-300" />}
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-red-300">Emergency status</p>
                <p className="mt-3 text-sm text-slate-300">
                  {offlineSms.loading
                    ? 'Offline SMS mode activated. Fetching GPS...'
                    : offlineSms.launched
                    ? 'Offline SMS mode activated. Your SMS app is ready.'
                    : !isOnline
                    ? 'Network unavailable. Offline SMS mode will be used.'
                    : toast?.message || gpsError || error}
                </p>
                {offlineSms.error && <p className="mt-2 text-xs text-red-200">{offlineSms.error}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
              <p className="mt-3 text-sm font-semibold text-white">{protectionEnabled ? 'Protection active' : 'Protection paused'}</p>
            </div>
            <div className="flex items-center gap-2">
              {protectionEnabled ? <ShieldCheck className="text-emerald-400" /> : <ShieldOff className="text-slate-400" />}
              <span className={`h-3 w-3 rounded-full ${protectionEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Emergency detection</p>
          <p className="mt-3 text-sm text-slate-300">Live crash sensing, manual SOS, admin dispatch, and trusted-contact fallback are enabled.</p>
          <p className="mt-2 text-xs text-slate-500">Alerts waiting: {helperIncomingAlerts.length}</p>
        </div>

        <button
          onClick={toggleProtection}
          className="w-full rounded-3xl bg-cyan-500 px-4 py-4 text-sm font-semibold text-white hover:bg-cyan-400 transition"
        >
          {protectionEnabled ? 'Pause Protection' : 'Restore Protection'}
        </button>
      </div>
    </div>
  );
}
