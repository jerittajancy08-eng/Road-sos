import { ArrowRight, CheckCircle2, Clock3, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ResponderTrackingCard({ role, activeResponder, incidentPhase, etaLabel, requests, onAcceptRequest, onDeclineRequest, onUpdateStatus }) {
  if (role !== "user") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Responder mode</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Incoming requests</h2>
          </div>
          <Users className="h-6 w-6 text-cyan-300" />
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 text-slate-400">
              No active requests yet. The system will notify you when help is needed.
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{request.user || "Emergency case"}</p>
                    <p className="mt-1 text-sm text-slate-400">{request.distance || "Nearby"}</p>
                  </div>
                  <span className="rounded-full bg-slate-950/80 px-3 py-2 text-xs text-slate-300 uppercase tracking-[0.24em]">
                    {request.status || "pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onAcceptRequest(request.id)}
                    className="rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Accept request
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeclineRequest(request.id)}
                    className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Decline
                  </button>
                </div>

                {request.accepted && (
                  <div className="mt-4 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Request accepted. Update status when you arrive.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {['arrived', 'transporting', 'resolved'].map((value) => (
                        <button
                          key={value}
                          onClick={() => onUpdateStatus(request.id, value)}
                          className="rounded-3xl bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Responder tracking</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Assigned responder</h2>
        </div>
        <Clock3 className="h-6 w-6 text-slate-400" />
      </div>

      {activeResponder ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.75rem] bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Responder</p>
                <p className="mt-1 text-lg font-semibold text-white">{activeResponder.name}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/75 px-3 py-2 text-sm text-slate-300 ring-1 ring-white/10">
                {activeResponder.type}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">ETA</p>
                <p className="mt-2 text-lg font-semibold text-white">{etaLabel}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Status</p>
                <p className="mt-2 text-lg font-semibold text-white">{incidentPhase}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Current route</p>
              <p className="mt-3 text-sm text-slate-300">View the live route on the map above.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Action</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <ArrowRight className="h-4 w-4" />
                Track live
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-slate-300">
          <p className="text-sm font-semibold text-white">No responder assigned yet.</p>
          <p className="mt-3 text-sm text-slate-400">If an accident is confirmed, the nearest responder will appear here immediately.</p>
        </div>
      )}
    </motion.section>
  );
}
