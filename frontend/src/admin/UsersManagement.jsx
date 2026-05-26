import { useMemo, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import AdminCard from "../components/admin/AdminCard";
import AdminStatusBadge from "../components/admin/AdminStatusBadge";
import { db } from "../firebase";
import { formatTimestamp, useAdminCollection } from "./useAdminCollection";

export default function UsersManagement() {
  const { items: users, loading } = useAdminCollection("users");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.fullName || user.name || ""} ${user.email || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole = role === "all" || user.role === role;
      const matchesStatus = status === "all" || user.verificationStatus === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [role, search, status, users]);

  const disableAccount = async (user) => {
    await setDoc(doc(db, "users", user.uid || user.id), { disabled: true, updatedAt: Date.now() }, { merge: true });
  };

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
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <AdminCard key={user.uid || user.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-black text-white">{user.fullName || user.name || user.email}</h2>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">Created: {formatTimestamp(user.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AdminStatusBadge value={user.role || "user"} />
                <AdminStatusBadge value={user.verificationStatus || "approved"} />
                {user.disabled && <AdminStatusBadge value="disabled" />}
                <button onClick={() => disableAccount(user)} className="rounded-2xl bg-red-500/15 px-4 py-2 text-xs font-bold text-red-300 ring-1 ring-red-400/30 hover:bg-red-500/25">Disable</button>
              </div>
            </div>
          </AdminCard>
        ))}
        {!filteredUsers.length && !loading && <p className="text-sm text-slate-500">No users match the selected filters.</p>}
      </div>
    </div>
  );
}
