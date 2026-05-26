export default function AdminCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-sm font-black uppercase tracking-[0.28em] text-white">{title}</h2>}
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
