import { AnimatePresence, motion } from "framer-motion";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import VerificationPendingCard from "./VerificationPendingCard";

export default function HospitalDashboard() {
  const { dispatchQueue, acceptIncident, markArrived, startTransport, completeIncident, userProfile, responderApproved, isOnline } = useEmergencyContext();
  const incomingPatients = dispatchQueue.filter((incident) => String(incident.severity).toLowerCase() === "high" || incident.status !== "completed");

  return (
    <div className="min-h-full px-4 pt-4">
      <header className="road-card mb-3 px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Medical Help</p>
        <h1 className="mt-1 text-lg font-bold text-white">{userProfile.name || "Emergency Medical Unit"}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] font-bold text-slate-300">{responderApproved ? "Live" : "Verification Pending"}</span>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-300">{isOnline ? "Connected" : "Offline"}</span>
        </div>
      </header>

      {!responderApproved && <VerificationPendingCard />}

      {responderApproved && (
        <>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Cases", value: incomingPatients.length, color: "text-red-300" },
          { label: "Open", value: incomingPatients.filter((item) => item.status !== "completed").length, color: "text-cyan-300" },
          { label: "Done", value: dispatchQueue.filter((item) => item.status === "completed").length, color: "text-emerald-300" },
        ].map((item) => (
          <div key={item.label} className="road-card px-3 py-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            <p className={`mt-1 text-xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <section className="road-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Incoming trauma</h2>
          <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black text-red-300">{incomingPatients.length} Active</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {incomingPatients.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                <p className="text-sm font-bold text-white">No active requests</p>
                <p className="mt-2 text-xs text-slate-500">Waiting for nearby incidents.</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Dispatch system active</p>
              </motion.div>
            ) : (
              incomingPatients.map((patient) => (
                <motion.div key={patient.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black uppercase text-white">Incident #{patient.id.slice(0, 6)}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{patient.reporter?.bloodGroup ? `Blood ${patient.reporter.bloodGroup}` : "Emergency intake"}</p>
                    </div>
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">{patient.severity}</span>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl bg-white/[0.04] p-3"><p className="text-slate-500">Reporter</p><p className="mt-1 font-bold text-white">{patient.reporter?.name || "RoadSOS User"}</p></div>
                    <div className="rounded-2xl bg-white/[0.04] p-3"><p className="text-slate-500">Status</p><p className="mt-1 font-bold capitalize text-white">{patient.status}</p></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => acceptIncident(patient.id)} className="rounded-2xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white">Accept Intake</button>
                    <button onClick={() => markArrived(patient.id)} className="rounded-2xl bg-amber-600 py-3 text-[10px] font-black uppercase tracking-widest text-white">Arrived</button>
                    <button onClick={() => startTransport(patient.id)} className="rounded-2xl bg-cyan-600 py-3 text-[10px] font-black uppercase tracking-widest text-white">Transport</button>
                    <button onClick={() => completeIncident(patient.id)} className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-[10px] font-black uppercase tracking-widest text-slate-300">Complete</button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
