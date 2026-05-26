import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "./useAuth.jsx";
import { db } from "../firebase";
import { isResponderApproved, isResponderRole, normalizeRole } from "../utils/roleUtils";
import { CHENNAI_COORDINATES, isValidCoordinate, isValidPosition, positionFromLatLng } from "../utils/coordinateUtils";

const EmergencyContext = createContext();

const terminalStatuses = ["completed", "resolved", "rejected"];

function isActiveIncident(incident) {
  return incident && !terminalStatuses.includes(String(incident.status).toLowerCase());
}

function makeIncident({ lat, lng, userProfile, severity = "high" }) {
  const now = new Date().toISOString();
  return {
    id: `SOS-${Date.now()}`,
    type: "Emergency",
    severity,
    status: "detected",
    pos: [lat, lng],
    lat,
    lng,
    userId: userProfile.uid,
    createdBy: userProfile.uid,
    reporterId: userProfile.uid,
    reporter: {
      name: userProfile.name,
      phone: userProfile.phone,
      bloodGroup: userProfile.bloodGroup,
      emergencyContacts: userProfile.emergencyContacts,
    },
    responders: [],
    activity: [{ action: "created", actorName: userProfile.name, at: now }],
    timestamp: now,
    time: Date.now(),
    etaSeconds: 180,
  };
}

export function EmergencyProvider({ children }) {
  const { user } = useAuth();
  const [userPos, setUserPosState] = useState(CHENNAI_COORDINATES);
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const [gpsError, setGpsError] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [offlineSms, setOfflineSms] = useState({ active: false, launched: false, loading: false, error: "" });
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  const effectiveRole = normalizeRole(user?.role || user?.requestedRole || "user");
  const userProfile = useMemo(
    () => ({
      uid: user?.uid || "guest",
      name: user?.name || user?.fullName || "RoadSOS User",
      role: effectiveRole,
      requestedRole: user?.requestedRole || user?.role || "user",
      email: user?.email || "",
      phone: user?.phone || "",
      bloodGroup: user?.bloodGroup || "",
      emergencyContacts: user?.emergencyContacts || [],
      verified: user?.verified !== false && user?.verificationStatus !== "pending",
      verificationStatus: user?.verificationStatus || "approved",
      stationName: user?.stationName || user?.hospitalName || "",
      badgeId: user?.badgeId || user?.registrationId || user?.officerId || user?.governmentId || "",
      city: user?.city || "",
      availability: user?.availability || "online",
    }),
    [user, effectiveRole],
  );
  const responderApproved = isResponderApproved(userProfile);

  useEffect(() => {
    if (!user?.uid) {
      setIncidents([]);
      return undefined;
    }

    const incidentsQuery = query(collection(db, "incidents"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(
      incidentsQuery,
      (snapshot) => {
        setIncidents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (snapshotError) => {
        console.error("Failed to sync incidents:", snapshotError);
        setError("Realtime updates are not connected.");
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setResponders([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setResponders(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .filter((item) => isResponderRole(item.role) && isResponderApproved(item))
            .map((item) => ({
              ...item,
              pos: item.liveLocation
                ? positionFromLatLng(item.liveLocation.lat, item.liveLocation.lng)
                : item.lastKnownLocation
                  ? positionFromLatLng(item.lastKnownLocation.lat, item.lastKnownLocation.lng)
                  : null,
              status: item.availability === false || item.availability === "offline" ? "offline" : "available",
            }))
            .filter((item) => item.pos),
        );
      },
      (snapshotError) => {
        console.error("Failed to sync responders:", snapshotError);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    setProtectionEnabled(user?.protectionEnabled !== false);
  }, [user?.protectionEnabled]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isValidCoordinate(position.coords.latitude, position.coords.longitude)) {
          setUserPosState([position.coords.latitude, position.coords.longitude]);
        }
        setGpsError("");
      },
      () => setGpsError("Location unavailable"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 9000 },
    );
  }, []);

  const userIncidents = useMemo(
    () => incidents.filter((incident) => incident.userId === userProfile.uid || incident.createdBy === userProfile.uid || incident.reporterId === userProfile.uid),
    [incidents, userProfile.uid],
  );

  const canReceiveHelp = isResponderRole(effectiveRole) && responderApproved;
  const dispatchQueue = canReceiveHelp ? incidents.filter(isActiveIncident) : userIncidents;
  const activeIncident = userIncidents.find(isActiveIncident) || dispatchQueue.find(isActiveIncident) || null;
  const activeEmergency = Boolean(activeIncident);
  const emergencyStatus = activeIncident?.status || "Idle";
  const helperIncomingAlerts = dispatchQueue.filter(isActiveIncident);
  const eta = activeIncident?.etaSeconds || 0;
  const ambPos = activeIncident?.responders?.[0]?.location
    ? [activeIncident.responders[0].location.lat, activeIncident.responders[0].location.lng]
    : userPos;
  const helpers = (activeIncident?.responders || []).map((responder) => ({
    id: responder.uid || responder.id,
    initials: String(responder.name || "RS").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    name: responder.name || "Responder",
    distance: responder.role || "Responder",
    status: responder.status || "accepted",
    accepted: ["accepted", "enroute", "arrived", "completed"].includes(responder.status),
    reached: ["arrived", "completed"].includes(responder.status),
  }));

  const addActivity = ({ title, subtitle, severity = "INFO" }) => {
    setActivityLog((prev) => [
      { id: `act-${Date.now()}`, title, subtitle, severity, timestamp: Date.now() },
      ...prev,
    ]);
  };

  const triggerSOS = async (lat, lng, options = {}) => {
    if (!lat || !lng) {
      setError("Location required for SOS");
      return null;
    }
    const incident = makeIncident({ lat, lng, userProfile, severity: options.severity || "high" });
    setUserPosState([lat, lng]);
    await setDoc(doc(db, "incidents", incident.id), {
      ...incident,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    addActivity({ title: "SOS started", subtitle: "Emergency help request created", severity: "HIGH" });
    setToast({ message: "SOS started." });
    if (!isOnline) setOfflineSms({ active: true, launched: true, loading: false, error: "" });
    return incident.id;
  };

  const triggerGlobalEmergency = (lat, lng) => triggerSOS(lat, lng, { severity: "high" });

  const toggleProtection = () => {
    setProtectionEnabled((prev) => {
      const next = !prev;
      addActivity({
        title: next ? "Protection active" : "Protection paused",
        subtitle: "Protection setting updated",
      });
      return next;
    });
  };

  const updateIncident = (incidentId, updater) => {
    const current = incidents.find((incident) => incident.id === incidentId);
    if (!current) return;
    const nextIncident = updater(current);
    setDoc(doc(db, "incidents", incidentId), { ...nextIncident, updatedAt: serverTimestamp() }, { merge: true }).catch((updateError) => {
      console.error("Failed to update incident:", updateError);
      setToast({ message: "Could not update incident." });
    });
  };

  const updateIncidentWithResponder = (incidentId, status) => {
    if (isResponderRole(effectiveRole) && !responderApproved) {
      setToast({ message: "Verification pending. Dispatch access is disabled." });
      return;
    }
    updateIncident(incidentId, (incident) => {
      const responders = (incident.responders || []).filter((item) => item.uid !== userProfile.uid);
      const nextResponder = {
        uid: userProfile.uid,
        name: userProfile.name,
        role: effectiveRole,
        phone: userProfile.phone,
        eta: Math.max(1, Math.ceil((incident.etaSeconds || 180) / 60)),
        status,
        location: { lat: userPos[0], lng: userPos[1] },
        updatedAt: new Date().toISOString(),
      };
      return {
        ...incident,
        status,
        assignedResponderId: status === "rejected" ? incident.assignedResponderId : userProfile.uid,
        responders: status === "rejected" ? responders : [...responders, nextResponder],
        activity: [
          ...(incident.activity || []),
          { action: status, actorName: userProfile.name, role: effectiveRole, at: new Date().toISOString() },
        ],
        completedAt: status === "completed" || status === "resolved" ? new Date().toISOString() : incident.completedAt,
      };
    });
    addActivity({ title: `Help ${status}`, subtitle: `${userProfile.name} marked a help request ${status}` });
  };

  const acceptIncident = (incidentId) => updateIncidentWithResponder(incidentId, "accepted");
  const rejectIncident = (incidentId) => updateIncidentWithResponder(incidentId, "rejected");
  const completeIncident = (incidentId) => updateIncidentWithResponder(incidentId, "completed");
  const assignResponderToIncident = (incidentId) => acceptIncident(incidentId);
  const acceptHelperAlert = (incidentId) => acceptIncident(incidentId);
  const updateIncidentStatus = (incidentId, status) => updateIncidentWithResponder(incidentId, status);
  const setResponderAvailability = (availability) => {
    if (!user?.uid || !isResponderRole(effectiveRole) || !responderApproved) return;
    setDoc(doc(db, "users", user.uid), { availability, updatedAt: serverTimestamp() }, { merge: true }).catch((availabilityError) => {
      console.error("Failed to update availability:", availabilityError);
      setToast({ message: "Could not update availability." });
    });
  };
  const endEmergency = () => activeIncident && completeIncident(activeIncident.id);

  const value = useMemo(
    () => ({
      activeEmergency,
      phase: activeIncident?.status?.toUpperCase() || "IDLE",
      protectionEnabled,
      emergencyStatus,
      helperIncomingAlerts,
      gpsError,
      isOnline,
      error,
      userPos,
      setUserPos: (position) => {
        if (isValidPosition(position)) setUserPosState(position);
      },
      ambPos,
      eta,
      helpers,
      responders,
      responderApproved,
      dispatchQueue,
      incidents,
      activityLog,
      currentUserRole: effectiveRole,
      userProfile,
      activeIncident,
      activeRoute: activeIncident ? [activeIncident.pos, userPos] : null,
      toast,
      offlineSms,
      triggerSOS,
      triggerGlobalEmergency,
      toggleProtection,
      assignResponderToIncident,
      acceptIncident,
      rejectIncident,
      updateIncidentStatus,
      completeIncident,
      setResponderAvailability,
      acceptHelperAlert,
      addActivity,
      endEmergency,
    }),
    [
      activeEmergency,
      activeIncident,
      protectionEnabled,
      emergencyStatus,
      helperIncomingAlerts,
      gpsError,
      isOnline,
      error,
      userPos,
      ambPos,
      eta,
      helpers,
      dispatchQueue,
      incidents,
      responders,
      activityLog,
      effectiveRole,
      userProfile,
      toast,
      offlineSms,
      responderApproved,
    ],
  );

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export const useEmergencyContext = () => {
  const context = useContext(EmergencyContext);
  if (!context) throw new Error("useEmergencyContext must be used within an EmergencyProvider");
  return context;
};
