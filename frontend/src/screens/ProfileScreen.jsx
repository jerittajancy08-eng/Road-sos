import { useEffect, useState } from "react";
import { Activity, Edit3, LogOut, Save, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth.jsx";
import { useEmergencyContext } from "../hooks/EmergencyContext";
import { displayRole, isResponderRole, profileTitles } from "../utils/roleUtils";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { incidents } = useEmergencyContext();
  const navigate = useNavigate();
  const role = user?.role || "user";
  const isResponder = isResponderRole(role);
  const totalHandled = incidents.filter((incident) => (incident.responders || []).some((responder) => responder.uid === user?.uid)).length;
  const profile = {
    name: user?.fullName || user?.name || "",
    age: user?.age || "",
    bloodGroup: user?.bloodGroup || "",
    allergies: user?.allergies || user?.medicalInfo || "",
    emergencyContactName: user?.emergencyContacts?.[0]?.name || "Primary",
    emergencyContactPhone: user?.emergencyContacts?.[0]?.phone || user?.emergencyContact || "",
    phone: user?.phone || "",
    email: user?.email || "",
    role: user?.role || "user",
    requestedRole: user?.requestedRole || user?.role || "user",
    verificationStatus: user?.verificationStatus || "approved",
    badgeId: user?.badgeId || "",
    stationName: user?.stationName || "",
    hospitalName: user?.hospitalName || "",
    registrationId: user?.registrationId || "",
    governmentId: user?.governmentId || "",
    city: user?.city || "",
    officerId: user?.officerId || "",
    availability: user?.availability === false ? "offline" : user?.availability || "online",
    createdAt: user?.createdAt || user?.joinedAt || "",
  };
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [showSaved, setShowSaved] = useState(false);
  const [autoShare, setAutoShare] = useState(true);

  useEffect(() => {
    setFormData(profile);
  }, [user?.uid, user?.updatedAt]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    await updateDoc(doc(db, "users", user.uid), {
      fullName: formData.name || "",
      name: formData.name || "",
      age: formData.age || "",
      bloodGroup: formData.bloodGroup || "",
      allergies: formData.allergies || "",
      medicalInfo: formData.allergies || "",
      emergencyContacts: [{ name: formData.emergencyContactName || "Primary", phone: formData.emergencyContactPhone || "" }],
      emergencyContact: formData.emergencyContactPhone || "",
      updatedAt: serverTimestamp(),
    });
    setEditMode(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/signin", { replace: true });
  };

  const fieldClass = "w-full rounded-2xl border border-white/10 bg-black/40 p-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/40";
  const notAdded = (value) => (value || "Not added");
  const noDetails = (value) => (value || "No details added");
  const joinedDate = profile.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString()
    : profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString()
      : "Not added";
  const stationOrDepartment = profile.stationName || profile.hospitalName || "Not added";
  const badgeOrUnit = profile.badgeId || profile.registrationId || profile.officerId || profile.governmentId || "Not added";

  return (
    <div className="min-h-full p-4 pt-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white">{profileTitles[profile.role] || "User Profile"}</h1>
          <p className="mt-1 text-xs text-slate-400">{isResponder ? "Role Details and emergency info" : "Your emergency details"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition-all ${
              editMode ? "border border-emerald-300/40 bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {editMode ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
          </button>
          <button onClick={handleLogout} className="rounded-2xl bg-red-500/10 p-2 text-red-200 ring-1 ring-red-300/20" aria-label="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {showSaved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 py-2 text-center text-xs font-bold text-emerald-300">
          Profile secured for emergency use
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        {isResponder && (
          <section className="road-card p-5">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Role Details</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Role", displayRole(profile.role)],
                ["Verification status", profile.verificationStatus],
                ["Station/Department", stationOrDepartment],
                ["Badge ID or Unit ID", badgeOrUnit],
                ["Assigned city", notAdded(profile.city)],
                ["Availability status", profile.availability],
                ["Total incidents handled", totalHandled],
                ["Joined date", joinedDate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-bold capitalize text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="road-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            <User size={12} /> {isResponder ? "User Emergency Info" : "Personal Details"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Full Name</label>
              {editMode ? <input name="name" value={formData.name || ""} onChange={handleChange} className={`${fieldClass} font-bold`} /> : <p className="font-bold text-white">{notAdded(profile.name)}</p>}
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Age</label>
              {editMode ? <input type="number" name="age" value={formData.age || ""} onChange={handleChange} className={`${fieldClass} font-mono`} /> : <p className="font-mono text-white">{profile.age ? `${profile.age} Years` : "Not added"}</p>}
            </div>
          </div>
        </section>

        <section className="road-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-300">
            <Activity size={12} /> Medical Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Blood Group</label>
              {editMode ? <input name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className={`${fieldClass} font-mono font-bold uppercase text-red-100`} /> : <span className="rounded border border-red-500/40 bg-red-500/20 px-2 py-0.5 font-mono font-bold text-red-300">{noDetails(profile.bloodGroup)}</span>}
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Severe Allergies</label>
              {editMode ? <input name="allergies" value={formData.allergies || ""} onChange={handleChange} className={`${fieldClass} font-mono text-red-100`} /> : <p className="truncate font-mono text-sm text-red-200">{noDetails(profile.allergies)}</p>}
            </div>
          </div>
        </section>

        <section className="road-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300">
            <ShieldAlert size={12} /> Auto-Notify Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Contact Name</label>
              {editMode ? <input name="emergencyContactName" value={formData.emergencyContactName || ""} onChange={handleChange} className={`${fieldClass} font-bold`} /> : <p className="font-bold text-white">{notAdded(profile.emergencyContactName)}</p>}
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Mobile Number</label>
              {editMode ? <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone || ""} onChange={handleChange} className={`${fieldClass} font-mono`} /> : <p className="font-mono text-white/80">{notAdded(profile.emergencyContactPhone)}</p>}
            </div>
          </div>
        </section>

        {!isResponder && <section className="road-card p-5">
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-cyan-300">Role Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Role</p>
              <p className="mt-1 text-sm font-bold capitalize text-white">{profile.role}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Verification</p>
              <p className="mt-1 text-sm font-bold text-emerald-300 capitalize">{profile.verificationStatus}</p>
            </div>
          </div>
          {profile.role !== "user" && (
            <div className="mt-3 space-y-2 rounded-2xl bg-white/[0.04] p-3 text-xs text-slate-300 ring-1 ring-white/10">
              {profile.role === "helper" && (
                <>
                  <p>Government ID: {profile.governmentId || "Pending"}</p>
                  <p>City: {profile.city || "Not provided"}</p>
                </>
              )}
              {profile.role === "police" && (
                <>
                  <p>Station: {profile.stationName || "Not provided"}</p>
                  <p>Badge ID: {profile.badgeId || "Pending"}</p>
                </>
              )}
              {profile.role === "hospital" && (
                <>
                  <p>Hospital name: {profile.hospitalName || profile.name || "Not provided"}</p>
                  <p>Registration ID: {profile.registrationId || "Pending"}</p>
                </>
              )}
              {profile.role === "fire" && (
                <>
                  <p>Department: {profile.stationName || "Not provided"}</p>
                  <p>Unit ID: {profile.officerId || "Pending"}</p>
                </>
              )}
            </div>
          )}
        </section>}

        {!editMode && (
          <section className="road-card p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-white">
                <ShieldCheck size={14} className="text-emerald-300" /> Protection controls
              </span>
              <button
                onClick={() => setAutoShare(!autoShare)}
                className={`flex h-5 w-10 rounded-full p-0.5 transition-all ${autoShare ? "bg-emerald-400" : "bg-slate-600"}`}
                aria-label="Toggle emergency auto-share"
              >
                <motion.span layout className="h-4 w-4 rounded-full bg-white" animate={{ x: autoShare ? 20 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} />
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-blue-500/20 bg-blue-900/10 px-4 py-2 text-center text-[10px] leading-relaxed text-slate-500">
              <ShieldAlert size={12} className="text-cyan-300" />
              Shared only during emergencies.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
