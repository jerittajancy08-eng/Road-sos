export default function LoadingMap({ message = "Getting your location..." }) {
  return (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-slate-950/80 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
        <p className="text-xs font-bold text-slate-300">{message}</p>
      </div>
    </div>
  );
}
