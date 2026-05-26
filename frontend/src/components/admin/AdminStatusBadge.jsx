const styles = {
  pending: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
  approved: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  verified: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  active: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-400/30 bg-red-500/10 text-red-300",
  high: "border-red-400/30 bg-red-500/10 text-red-300",
  medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
  low: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
};

export default function AdminStatusBadge({ value }) {
  const key = String(value || "pending").toLowerCase();
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${styles[key] || "border-white/10 bg-white/5 text-slate-300"}`}>
      {value || "pending"}
    </span>
  );
}
