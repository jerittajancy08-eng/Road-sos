import { ShieldAlert } from "lucide-react";

export default function VerificationPendingCard() {
  return (
    <div className="rounded-[28px] bg-slate-950/85 px-5 py-8 text-center text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ring-1 ring-yellow-300/20 backdrop-blur-xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-300/25 bg-yellow-400/10 text-yellow-300">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <p className="text-lg font-bold text-white">Verification Pending</p>
      <p className="mt-2 text-sm text-slate-400">Your responder account is waiting for approval.</p>
      <span className="mt-4 inline-flex rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-300">
        Verification Pending
      </span>
    </div>
  );
}
