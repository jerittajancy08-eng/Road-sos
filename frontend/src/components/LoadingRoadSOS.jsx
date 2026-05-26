export default function LoadingRoadSOS() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
        <p className="text-sm font-bold tracking-wide text-slate-200">Loading RoadSOS...</p>
      </div>
    </div>
  );
}
