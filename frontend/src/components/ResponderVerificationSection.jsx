import { ShieldAlert } from "lucide-react";

const roleLabels = {
  helper: "Helper",
  police: "Police",
  hospital: "Hospital",
  fire: "Fire Rescue",
};

const statusLabels = {
  approved: "Approved",
  verified: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

export default function ResponderVerificationSection({ profile }) {
  const role = profile?.role || "user";
  const details = profile?.verificationDetails || {};
  const idNumber =
    details.idNumber ||
    profile?.governmentId ||
    profile?.badgeId ||
    profile?.registrationId ||
    profile?.officerId ||
    "";
  const city = details.city || profile?.city || "";
  const fileName = details.fileName || profile?.verificationFileName || "";
  const status = profile?.verificationStatus || "PENDING";

  return (
    <div className="glass-panel p-5 border-white/10 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-500/5 rounded-full blur-xl"></div>
      <h2 className="text-[10px] uppercase font-bold text-slate-300 tracking-widest mb-4 flex items-center gap-2">
        <ShieldAlert size={12} /> Role Details
      </h2>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Role</label>
          <p className="text-white font-bold">{roleLabels[role] || role}</p>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Approval State</label>
          <p className="text-white font-mono">{statusLabels[status] || status}</p>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Verification Status</label>
          <p className="text-white font-mono">{status}</p>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">City / Location</label>
          <p className="text-white font-mono">{city || "Not submitted"}</p>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Verification ID</label>
          <p className="text-white font-mono break-words">{idNumber || "Not submitted"}</p>
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Uploaded File</label>
          <p className="text-white font-mono break-words">{fileName || "No file selected"}</p>
        </div>
      </div>
    </div>
  );
}
