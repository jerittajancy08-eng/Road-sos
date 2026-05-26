import { ShieldCheck, UserCircle } from "lucide-react";

export default function MobileEmergencyScreen() {
  return (
    <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-28 text-white overflow-y-auto">
      <div className="rounded-[32px] bg-slate-950/80 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/85 ring-1 ring-white/10">
            <UserCircle className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">You are protected</p>
            <h1 className="mt-1 text-base font-semibold text-white">Protection active</h1>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[28px] bg-slate-950/85 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-white/10 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
        <p className="mt-2 text-sm font-semibold text-white">Secure location monitoring</p>
      </div>

      <div className="relative mt-5 flex-1">
        <div className="absolute inset-x-0 top-0 h-full rounded-[40px] bg-[radial-gradient(circle_at_center,_rgba(15,118,255,0.12),transparent_18%)]" />
      </div>

      <div className="mt-6 rounded-[40px] bg-slate-950/95 px-5 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl">
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Nearby responders</p>
              <p className="mt-1 text-base font-semibold text-white">3 available</p>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200 ring-1 ring-cyan-300/15">Live</span>
          </div>

          <div className="rounded-3xl bg-slate-900/90 px-4 py-4 ring-1 ring-white/10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Assigned responder</p>
            <p className="mt-2 text-sm font-semibold text-white">City Rescue Team</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-3xl bg-slate-900/90 px-4 py-4 ring-1 ring-white/10">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">ETA</p>
              <p className="mt-2 text-sm font-semibold text-white">4 min</p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.2)] transition hover:bg-cyan-400">
                Request help
              </button>
              <button className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

