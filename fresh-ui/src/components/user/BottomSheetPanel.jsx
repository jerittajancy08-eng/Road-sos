import { motion } from "framer-motion";
import { ChevronUp, MapPin, ShieldCheck, Users } from "lucide-react";
import EmergencyStatusCard from "./EmergencyStatusCard";
import NearbyResponders from "./NearbyResponders";
import ResponderTrackingCard from "./ResponderTrackingCard";

export default function BottomSheetPanel({
  isOpen,
  onToggle,
  incidentPhase,
  etaLabel,
  activeResponder,
  emergencyContact,
  responders,
  onRequestHelp,
  role,
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onUpdateStatus,
}) {
  return (
    <motion.section
      initial={{ y: 160, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="absolute inset-x-0 bottom-0 z-40 px-4 pb-6 sm:px-6"
    >
      <div className="mx-auto max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/95 shadow-[0_40px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/10" />
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 ring-1 ring-white/10">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Protection summary</p>
              <p className="text-base font-semibold text-white">{activeResponder ? "Responder on the way" : "Protection active"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 text-slate-200 ring-1 ring-white/10"
            aria-label="Toggle sheet"
          >
            <ChevronUp className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
        </div>

        <div className="border-y border-white/10 px-5 py-4 text-sm text-slate-400">
          <div className="flex items-center justify-between gap-3">
            <span>{activeResponder ? "Nearest help is responding" : "Nearby assistance ready"}</span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400 ring-1 ring-white/10">{etaLabel || "Ready"}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-slate-300">
            <MapPin className="h-4 w-4 text-cyan-300" />
            <span>{activeResponder ? activeResponder.name : "City Hospital"}</span>
          </div>
        </div>

        <div className="px-5 py-5">
          <EmergencyStatusCard
            phase={incidentPhase}
            etaLabel={etaLabel}
            responderName={activeResponder?.name}
            emergencyContact={emergencyContact}
            onSafe={() => {}}
          />

          {isOpen && (
            <div className="mt-5 space-y-4">
              <ResponderTrackingCard
                role={role}
                activeResponder={activeResponder}
                incidentPhase={incidentPhase}
                etaLabel={etaLabel}
                requests={requests}
                onAcceptRequest={onAcceptRequest}
                onDeclineRequest={onDeclineRequest}
                onUpdateStatus={onUpdateStatus}
              />
              {role === "user" && (
                <NearbyResponders responders={responders} onRequestHelp={onRequestHelp} activeResponder={activeResponder} role={role} />
              )}
              {role !== "user" && (
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 text-slate-300">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <Users className="h-4 w-4 text-cyan-300" />
                    Emergency requests
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Accept or decline incoming cases from within the list above.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
