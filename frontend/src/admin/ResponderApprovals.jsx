import { doc, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { formatTimestamp, isResponderRole, useAdminCollection } from "./useAdminCollection";

export default function ResponderApprovals() {
  const { items: users, loading, error } = useAdminCollection("users");
  const responders = users.filter((user) => isResponderRole(user.role));

  const updateStatus = async (user, verificationStatus) => {
    await setDoc(
      doc(db, "users", user.uid || user.id),
      {
        verificationStatus,
        verified: verificationStatus === "approved",
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Responder Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Review helper, police, hospital, and fire rescue verification submissions.</p>
      </div>
      {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading responders...</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        {responders.map((user) => {
          const details = user.verificationDetails || {};
          const idNumber = details.idNumber || user.governmentId || user.badgeId || user.registrationId || user.officerId || "Not submitted";
          const city = details.city || user.city || "Not submitted";
          const fileName = details.fileName || user.verificationFileName || "No file selected";

          return (
            <AdminCard key={user.uid || user.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white">{user.fullName || user.name || user.email}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{user.role}</p>
                </div>
                <AdminStatusBadge value={user.verificationStatus || "pending"} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div><p className="text-slate-500">City</p><p className="font-mono text-white">{city}</p></div>
                <div><p className="text-slate-500">Verification ID</p><p className="font-mono text-white break-words">{idNumber}</p></div>
                <div><p className="text-slate-500">Uploaded Filename</p><p className="font-mono text-white break-words">{fileName}</p></div>
                <div><p className="text-slate-500">Created</p><p className="font-mono text-white">{formatTimestamp(user.createdAt)}</p></div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => updateStatus(user, "approved")} className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25">Approve</button>
                <button onClick={() => updateStatus(user, "rejected")} className="rounded-2xl bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 ring-1 ring-red-400/30 hover:bg-red-500/25">Reject</button>
              </div>
            </AdminCard>
          );
        })}
        {!responders.length && !loading && <p className="text-sm text-slate-500">No responder registrations found.</p>}
      </div>
    </div>
  );
}
