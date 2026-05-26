import { ShieldAlert } from "lucide-react";

export default function FloatingEmergencyButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full bg-rose-500/95 p-4 text-white shadow-[0_18px_45px_rgba(220,38,38,0.16)] ring-1 ring-white/15 transition hover:bg-rose-400"
      aria-label="Emergency action"
    >
      <ShieldAlert className="h-6 w-6" />
    </button>
  );
}
