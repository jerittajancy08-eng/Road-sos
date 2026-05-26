import { ShieldCheck } from "lucide-react";

export default function SplashScreen({ onDismiss }) {
  setTimeout(onDismiss, 2500);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="relative w-[390px] h-[844px] rounded-[40px] overflow-hidden bg-[#061120] border border-white/10 shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-[#061120]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.15),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),transparent_26%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/20 ring-2 ring-cyan-400">
            <ShieldCheck className="h-10 w-10 text-cyan-300" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">RoadSOS</h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">Emergency protection when every second matters</p>
        </div>
      </div>
    </div>
  );
}
