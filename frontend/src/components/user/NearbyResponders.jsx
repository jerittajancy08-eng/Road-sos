import { Cross, Flame, Shield, HeartPulse } from "lucide-react";

const iconByType = {
  hospital: Cross,
  police: Shield,
  fire: Flame,
  helper: HeartPulse,
};

export default function NearbyResponders({ responders, onRequestHelp, activeResponder, role }) {
  return (
    <div className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Nearby responders</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Trusted assistance nearby</h2>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 ring-1 ring-white/10">
          {responders.length} available
        </span>
      </div>

      <div className="grid gap-4">
        {responders.map((responder) => {
          const Icon = iconByType[responder.type] || Shield;
          const isActive = activeResponder?.id === responder.id;

          return (
            <div key={responder.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/80 text-cyan-300 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{responder.name}</p>
                    <p className="text-sm text-slate-400">{responder.type === "helper" ? "Verified helper" : responder.type}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-400">
                  <p>{responder.distance}</p>
                  <p className="mt-1 text-xs text-slate-500">{responder.status}</p>
                </div>
              </div>

              {role === "user" ? (
                <button
                  type="button"
                  onClick={() => onRequestHelp(responder)}
                  disabled={isActive}
                  className={`mt-4 w-full rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "cursor-not-allowed bg-slate-800 text-slate-400"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  }`}
                >
                  {isActive ? "Help assigned" : "Request help"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
