import { useEmergencyContext } from '../hooks/EmergencyContext';
import { useState } from 'react';
import { AlertTriangle, RadioTower, ShieldCheck, ShieldOff, WifiOff, Zap } from 'lucide-react';

function getGpsPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.latitude, position.coords.longitude]),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
    );
  });
}

export default function ProtectionScreen() {
  const showDevTools = import.meta.env.DEV;
  const {
    protectionEnabled,
    toggleProtection,
    activeEmergency,
    emergencyStatus,
    helperIncomingAlerts,
    gpsError,
    isOnline,
    error,
    userPos,
    setUserPos,
    triggerSOS,
    offlineSms,
    toast,
  } = useEmergencyContext();
  const [sosState, setSosState] = useState('idle');
  const [localError, setLocalError] = useState('');

  const handleEmergency = async ({ simulate = false } = {}) => {
    if (sosState === 'sending') return;
    setLocalError('');
    setSosState(navigator.onLine ? 'sending' : 'offline');

    let position = Array.isArray(userPos) ? userPos : [28.6139, 77.2090];
    try {
      position = simulate ? position : await getGpsPosition();
      setUserPos(position);
    } catch {
      setLocalError('GPS unavailable');
      setSosState(navigator.onLine ? 'gps-fallback' : 'offline');
    }

    try {
      await triggerSOS(position[0], position[1], {
        type: 'emergency',
        severity: 'high',
        source: simulate ? 'demo-simulation' : 'protection-sos',
        bypassProtection: true,
      });
      setSosState(navigator.onLine ? 'sent' : 'offline');
      if (navigator.onLine) {
        window.setTimeout(() => setSosState('notified'), 900);
      }
    } catch {
      setLocalError(navigator.onLine ? 'Emergency could not be sent. Try again.' : 'Offline SMS mode activated');
      setSosState(navigator.onLine ? 'error' : 'offline');
    }
  };

  const statusLabel = offlineSms.active
    ? offlineSms.loading
      ? 'Offline SMS mode activated'
      : offlineSms.launched
      ? 'Offline SMS ready'
      : 'Offline SMS mode activated'
    : sosState === 'sending'
    ? 'Sending emergency...'
    : sosState === 'sent'
    ? 'Emergency sent'
    : sosState === 'notified'
    ? 'Responders notified'
    : localError || gpsError
    ? 'GPS unavailable'
    : activeEmergency
    ? emergencyStatus
    : 'Idle';

  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-44 text-white overflow-y-auto">
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
        {(gpsError || localError || error || !isOnline || toast || offlineSms.active) && (
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
                    : toast?.message || localError || gpsError || error}
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

        <div className="relative overflow-hidden rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-red-500/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_34%)]" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <RadioTower className="h-4 w-4 text-red-300" />
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Realtime emergency uplink</p>
            </div>
            <p className="mt-3 text-sm text-slate-300">SOS incidents appear instantly in admin live incidents, dispatch, counters, and the map when online.</p>
            {showDevTools && (
              <button
                type="button"
                onClick={() => handleEmergency({ simulate: true })}
                disabled={sosState === 'sending'}
                className="mt-4 w-full rounded-3xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-50"
              >
                Simulate Emergency
              </button>
            )}
          </div>
        </div>

        <button
          onClick={toggleProtection}
          className="w-full rounded-3xl bg-cyan-500 px-4 py-4 text-sm font-semibold text-white hover:bg-cyan-400 transition"
        >
          {protectionEnabled ? 'Pause Protection' : 'Restore Protection'}
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-24 z-[850] px-5">
        <button
          type="button"
          onClick={() => handleEmergency()}
          disabled={sosState === 'sending'}
          className="siren-pulse emergency-sos-glow flex w-full items-center justify-center gap-3 rounded-[2rem] border border-red-200/25 bg-red-600 px-5 py-5 text-base font-black uppercase tracking-[0.18em] text-white shadow-2xl transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-70"
        >
          <Zap className="h-6 w-6" />
          {sosState === 'sending' ? 'Sending emergency...' : 'EMERGENCY SOS'}
        </button>
      </div>
    </div>
  );
}
