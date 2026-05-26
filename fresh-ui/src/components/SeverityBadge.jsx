export default function SeverityBadge({ severity }) {
  const getStyle = () => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_10px_rgba(255,51,102,0.3)]';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40 shadow-[0_0_10px_rgba(255,215,0,0.3)]';
      case 'LOW':
        return 'bg-green-500/20 text-neon-green border-green-500/40 shadow-[0_0_10px_rgba(0,255,102,0.3)]';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStyle()}`}>
      {severity} IMPACT
    </span>
  );
}
