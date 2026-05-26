import { useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { formatTimestamp, useAdminCollection } from "./useAdminCollection";

export default function UsersManagement() {
  const { items: users, loading } = useAdminCollection("users");
  const { items: incidents } = useAdminCollection("incidents", { orderBy: "createdAt" });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!user || !(user.uid || user.id) || !(user.email || user.phone || user.fullName || user.name)) return false;
      const text = `${user.fullName || user.name || ""} ${user.email || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole = role === "all" || user.role === role;
      const matchesStatus = status === "all" || user.verificationStatus === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [role, search, status, users]);

  const disableAccount = async (user) => {
    await setDoc(doc(db, "users", user.uid || user.id), { disabled: true, accountStatus: "disabled", updatedAt: serverTimestamp() }, { merge: true });
  };
  const reactivateAccount = async (user) => setDoc(doc(db, "users", user.uid || user.id), { disabled: false, accountStatus: "active", updatedAt: serverTimestamp() }, { merge: true });
  const suspendResponder = async (user) => setDoc(doc(db, "users", user.uid || user.id), { verificationStatus: "suspended", verified: false, accountStatus: "suspended", updatedAt: serverTimestamp() }, { merge: true });
  const resetVerification = async (user) => setDoc(doc(db, "users", user.uid || user.id), { verificationStatus: "pending", verified: false, updatedAt: serverTimestamp() }, { merge: true });
  const forceLogout = async (user) => setDoc(doc(db, "users", user.uid || user.id), { forceLogoutAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Users Management</h1>
        <p className="mt-1 text-sm text-slate-500">Search, filter, inspect, and flag RoadSOS accounts.</p>
      </div>
      <AdminCard>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10" />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10">
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="helper">Helper</option>
            <option value="police">Police</option>
            <option value="hospital">Hospital</option>
            <option value="fire">Fire</option>
            <option value="admin">Admin</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10">
            <option value="all">All approval states</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </AdminCard>
      {loading && <p className="text-sm text-slate-500">Loading users...</p>}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
        <div className="grid grid-cols-[1.25fr_0.8fr_0.9fr_0.6fr_0.9fr_auto] gap-3 border-b border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 max-xl:hidden">
          <span>User</span><span>Role</span><span>Status</span><span>History</span><span>Last Activity</span><span>Action</span>
        </div>
        {filteredUsers.map((user) => (
          <div key={user.uid || user.id} className="border-b border-white/10 px-4 py-3 last:border-b-0">
            <div className="grid gap-3 xl:grid-cols-[1.25fr_0.8fr_0.9fr_0.6fr_0.9fr_auto] xl:items-center">
              <div>
                <button onClick={() => setSelectedUser(user)} className="text-left font-black text-white hover:text-cyan-300">{user.fullName || user.name || user.email || user.phone}</button>
                <p className="text-xs text-slate-500">{user.email || user.phone || "Contact pending"}</p>
                {user.createdAt && <p className="mt-1 text-xs text-slate-500">Created: {formatTimestamp(user.createdAt)}</p>}
              </div>
              <AdminStatusBadge value={user.role || "user"} />
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge value={user.disabled ? "disabled" : user.accountStatus || "active"} />
                <AdminStatusBadge value={user.verificationStatus || (user.role === "user" ? "approved" : "pending")} />
              </div>
              <p className="font-mono text-sm text-white">{incidents.filter((incident) => incident.userId === (user.uid || user.id) || incident.createdBy === (user.uid || user.id) || incident.reporterId === (user.uid || user.id)).length}</p>
              <p className="text-xs text-slate-400">{formatTimestamp(user.lastActivityAt || user.updatedAt || user.createdAt)}</p>
              <button onClick={() => setSelectedUser(user)} className="w-fit rounded-2xl bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/30 hover:bg-cyan-500/25">Details</button>
            </div>
          </div>
        ))}
        {!filteredUsers.length && !loading && <p className="text-sm text-slate-500">No users match the selected filters.</p>}
      </div>
      {selectedUser && (
        <div className="fixed inset-0 z-[1200] bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="ml-auto h-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-300/15 bg-slate-950 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">User Detail</p>
                <h2 className="mt-2 text-2xl font-black text-white">{selectedUser.fullName || selectedUser.name || selectedUser.email}</h2>
                <p className="mt-1 text-sm text-slate-400">{selectedUser.email}</p>
              </div>
              <button className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
            <AdminCard title="Account Status">
              <div className="grid gap-3 md:grid-cols-2">
                <p className="text-sm text-slate-300">Role: <span className="font-bold text-white">{selectedUser.role || "user"}</span></p>
                <p className="text-sm text-slate-300">Verification: <span className="font-bold text-white">{selectedUser.verificationStatus || "approved"}</span></p>
                <p className="text-sm text-slate-300">Created: <span className="font-bold text-white">{formatTimestamp(selectedUser.createdAt)}</span></p>
                <p className="text-sm text-slate-300">Last activity: <span className="font-bold text-white">{formatTimestamp(selectedUser.lastActivityAt || selectedUser.updatedAt)}</span></p>
              </div>
            </AdminCard>
            <AdminCard title="Emergency Logs" className="mt-4">
              <div className="space-y-2">
                {incidents.filter((incident) => incident.userId === (selectedUser.uid || selectedUser.id) || incident.createdBy === (selectedUser.uid || selectedUser.id) || incident.reporterId === (selectedUser.uid || selectedUser.id)).map((incident) => (
                  <div key={incident.id} className="rounded-2xl bg-white/5 p-3 text-sm text-white">{incident.type || incident.category || "emergency"} · {incident.status || "active"}</div>
                ))}
              </div>
            </AdminCard>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => disableAccount(selectedUser)} className="rounded-2xl bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 ring-1 ring-red-400/30">Disable user</button>
              <button onClick={() => suspendResponder(selectedUser)} className="rounded-2xl bg-orange-500/15 px-4 py-2 text-xs font-bold text-orange-300 ring-1 ring-orange-400/30">Suspend responder</button>
              <button onClick={() => reactivateAccount(selectedUser)} className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">Reactivate</button>
              <button onClick={() => forceLogout(selectedUser)} className="rounded-2xl bg-yellow-500/15 px-4 py-2 text-xs font-bold text-yellow-300 ring-1 ring-yellow-400/30">Force logout</button>
              <button onClick={() => resetVerification(selectedUser)} className="rounded-2xl bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/30">Reset verification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
