import AdminCard from "./AdminCard";

export default function AdminStatCard({ label, value, tone = "cyan", detail }) {
  const tones = {
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-400/20",
    green: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
    yellow: "text-yellow-300 bg-yellow-500/10 border-yellow-400/20",
    red: "text-red-300 bg-red-500/10 border-red-400/20",
  };

  return (
    <AdminCard className={`border ${tones[tone] || tones.cyan}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      {detail && <p className="mt-2 text-xs text-slate-400">{detail}</p>}
    </AdminCard>
  );
}
