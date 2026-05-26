import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { formatTimestamp, isResponderRole, useAdminCollection } from "./useAdminCollection";
import { getApprovalValidation, getCity, getDocumentName, getLicense, getOrganization } from "./adminUtils";

const statusValues = {
  approved: "APPROVED",
  rejected: "REJECTED",
  suspended: "SUSPENDED",
  pending: "PENDING",
};

export default function ResponderApprovals() {
  const { items: users, loading, error } = useAdminCollection("users");
  const [previewUser, setPreviewUser] = useState(null);
  const responders = users.filter((user) => isResponderRole(user.role));

  const updateStatus = async (user, nextStatus) => {
    const verificationStatus = statusValues[nextStatus] || nextStatus;
    const uid = user.uid || user.id;
    console.log("[RoadSOS approval write:start]", { uid, role: user.role, verificationStatus });
    await setDoc(
      doc(db, "users", uid),
      {
        verificationStatus,
        accountStatus: verificationStatus === "SUSPENDED" ? "suspended" : "active",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await setDoc(doc(db, "responders", uid), {
      uid,
      role: user.role,
      name: user.fullName || user.name || user.email || "",
      verificationStatus,
      organization: getOrganization(user),
      city: getCity(user),
      badgeLicense: getLicense(user),
      createdAt: user.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log("[RoadSOS approval write:success]", { uid, verificationStatus });
    await setDoc(doc(db, "notifications", `approval-${uid}-${Date.now()}`), {
      userId: uid,
      audience: "responder",
      title: "Verification status updated",
      body: `Your RoadSOS responder verification is now ${verificationStatus}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, "activityLogs", `approval-${uid}-${Date.now()}`), {
      userId: uid,
      title: "Responder verification updated",
      subtitle: `${user.fullName || user.name || user.email} marked ${verificationStatus}`,
      type: "approval",
      severity: verificationStatus === "APPROVED" ? "info" : "high",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Responder Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Review helper, police, hospital, and fire rescue verification submissions.</p>
      </div>
      {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading responders...</p>}
      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {responders.map((user) => {
          const details = user.verificationDetails || {};
          const idNumber = getLicense(user) || "Verification Required";
          const city = getCity(user) || "Not Submitted";
          const fileName = getDocumentName(user) || "Not Submitted";
          const organization = getOrganization(user) || "Verification Required";
          const validation = getApprovalValidation(user);
          const approvalReady = validation.valid;

          return (
            <AdminCard key={user.uid || user.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white">{user.fullName || user.name || user.email}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{user.role}</p>
                </div>
                <AdminStatusBadge value={user.verificationStatus || "PENDING"} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div><p className="text-slate-500">Organization</p><p className="font-mono text-white">{organization}</p></div>
                <div><p className="text-slate-500">City</p><p className="font-mono text-white">{city}</p></div>
                <div><p className="text-slate-500">Badge / License</p><p className="font-mono text-white break-words">{idNumber}</p></div>
                <div><p className="text-slate-500">Account</p><p className="font-mono text-white break-words">{user.email || user.phone || "Not submitted"}</p></div>
                <div className="col-span-2"><p className="text-slate-500">Verification Document</p><p className="font-mono text-white break-words">{fileName}</p></div>
                <div className="col-span-2"><p className="text-slate-500">Created</p><p className="font-mono text-white">{formatTimestamp(user.createdAt)}</p></div>
              </div>
              {!approvalReady && (
                <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200">
                  <p>Verification Required</p>
                  <p className="mt-1 font-normal text-red-100/80">Awaiting: {validation.missing.map((item) => item === "verification document" ? "document" : item).join(", ")}</p>
                  <p className="mt-2 text-[11px] font-normal text-slate-300">Admin override available</p>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => updateStatus(user, "APPROVED")} className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25">Approve</button>
                <button onClick={() => updateStatus(user, "REJECTED")} className="rounded-2xl bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 ring-1 ring-red-400/30 hover:bg-red-500/25">Reject</button>
                <button onClick={() => updateStatus(user, "SUSPENDED")} className="rounded-2xl bg-orange-500/15 px-4 py-2 text-xs font-bold text-orange-300 ring-1 ring-orange-400/30 hover:bg-orange-500/25">Suspend</button>
                <button onClick={() => setPreviewUser(user)} className="rounded-2xl bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/30 hover:bg-cyan-500/25">Document</button>
              </div>
            </AdminCard>
          );
        })}
        {!responders.length && !loading && <p className="text-sm text-slate-500">No responder registrations found.</p>}
      </div>
      {previewUser && (
        <div className="fixed inset-0 z-[1200] bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPreviewUser(null)}>
          <div className="mx-auto max-w-2xl rounded-2xl border border-cyan-300/15 bg-slate-950 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-white">Verification Preview</h2>
              <button className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white" onClick={() => setPreviewUser(null)}>Close</button>
            </div>
            {getDocumentName(previewUser) ? (
              <a className="break-all text-sm font-semibold text-cyan-300" href={previewUser.verificationDocumentUrl || previewUser.documentUrl || previewUser.idProofUrl || "#"} target="_blank" rel="noreferrer">
                {getDocumentName(previewUser)}
              </a>
            ) : (
              <p className="text-sm text-slate-400">Not Submitted</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
