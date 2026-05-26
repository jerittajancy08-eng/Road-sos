import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "./useAuth.jsx";
import { db } from "../firebase";
import { isResponderApproved, isResponderRole, normalizeRole } from "../utils/roleUtils";
import { CHENNAI_COORDINATES, isValidCoordinate, isValidPosition, positionFromLatLng } from "../utils/coordinateUtils";
import { INCIDENT_STATES, estimateEtaSeconds, getPosition, normalizeIncidentCategory, normalizeIncidentState } from "../admin/adminUtils";

const EmergencyContext = createContext();

const terminalStatuses = [INCIDENT_STATES.RESOLVED, INCIDENT_STATES.CLOSED, "REJECTED"];

function isActiveIncident(incident) {
  return incident && !terminalStatuses.includes(normalizeIncidentState(incident.status || incident.lifecycleStage));
}

function makeIncident({ lat, lng, userProfile, severity = "high" }) {
  const now = new Date().toISOString();
  return {
    id: `SOS-${Date.now()}`,
    category: normalizeIncidentCategory("emergency"),
    type: normalizeIncidentCategory("emergency"),
    emergencyType: normalizeIncidentCategory("emergency"),
    severity,
    status: INCIDENT_STATES.DETECTED,
    lifecycleStage: INCIDENT_STATES.DETECTED,
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
    etaSeconds: null,
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

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setResponders(
        snapshot.docs
          .map((item) => ({ id: item.id, uid: item.id, ...item.data() }))
          .filter((item) => isResponderRole(item.role) && isResponderApproved(item))
          .map((item) => ({ ...item, pos: getPosition(item), status: item.availability === false || item.availability === "offline" ? "offline" : item.availability || "available" }))
          .filter((item) => item.pos),
      );
    }, (snapshotError) => console.error("Failed to sync responders:", snapshotError));

    const unsubLive = onSnapshot(collection(db, "responders"), (snapshot) => {
      setResponders((current) => {
        const byId = new Map(current.map((item) => [item.uid || item.id, item]));
        snapshot.docs.forEach((item) => {
          const live = { id: item.id, uid: item.id, ...item.data() };
          byId.set(live.uid || live.id, { ...(byId.get(live.uid || live.id) || {}), ...live, pos: getPosition(live) });
        });
        return Array.from(byId.values()).filter((item) => isResponderRole(item.role) && (item.verified === true || isResponderApproved(item)) && item.pos);
      });
    }, (snapshotError) => console.error("Failed to sync live responders:", snapshotError));

    return () => {
      unsubUsers();
      unsubLive();
    };
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
    if (!navigator.geolocation || !user?.uid) return undefined;
    const persistPosition = (position) => {
      if (!isValidCoordinate(position.coords.latitude, position.coords.longitude)) return;
      const nextPosition = [position.coords.latitude, position.coords.longitude];
      setUserPosState(nextPosition);
      setGpsError("");
      const locationPatch = {
        liveLocation: { lat: nextPosition[0], lng: nextPosition[1], accuracy: position.coords.accuracy || null, updatedAt: serverTimestamp() },
        lastKnownLocation: { lat: nextPosition[0], lng: nextPosition[1] },
        updatedAt: serverTimestamp(),
      };
      setDoc(doc(db, "users", user.uid), locationPatch, { merge: true }).catch((locationError) => console.error("Failed to sync user GPS:", locationError));
      if (isResponderRole(effectiveRole) && responderApproved) {
        setDoc(doc(db, "responders", user.uid), { ...locationPatch, uid: user.uid, role: effectiveRole, name: userProfile.name, verified: true, online: true }, { merge: true }).catch((locationError) => console.error("Failed to sync responder GPS:", locationError));
      }
    };
    navigator.geolocation.getCurrentPosition(
      persistPosition,
      () => setGpsError("Location unavailable"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 9000 },
    );
    const watchId = navigator.geolocation.watchPosition(
      persistPosition,
      () => setGpsError("Location permission or signal unavailable"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [effectiveRole, responderApproved, user?.uid, userProfile.name]);

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
  const assignedResponder = responders.find((responder) => {
    const responderId = responder.uid || responder.id;
    return activeIncident?.assignedResponderId === responderId || activeIncident?.responders?.some((item) => item.uid === responderId || item.id === responderId);
  });
  const eta = activeIncident && assignedResponder ? estimateEtaSeconds(assignedResponder, activeIncident) : activeIncident?.etaSeconds || 0;
  const ambPos = activeIncident?.responders?.[0]?.location
    ? [activeIncident.responders[0].location.lat, activeIncident.responders[0].location.lng]
    : userPos;
  const helpers = (activeIncident?.responders || []).map((responder) => ({
    id: responder.uid || responder.id,
    initials: String(responder.name || "RS").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    name: responder.name || "Responder",
    distance: responder.role || "Responder",
    status: normalizeIncidentState(responder.status || INCIDENT_STATES.RESPONDER_ASSIGNED),
    accepted: [INCIDENT_STATES.RESPONDER_ASSIGNED, INCIDENT_STATES.EN_ROUTE, INCIDENT_STATES.ACTIVE_RESCUE, INCIDENT_STATES.RESOLVED].includes(normalizeIncidentState(responder.status)),
    reached: [INCIDENT_STATES.ACTIVE_RESCUE, INCIDENT_STATES.RESOLVED].includes(normalizeIncidentState(responder.status)),
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
      category: normalizeIncidentCategory(incident.category || incident.type || incident.emergencyType),
      type: normalizeIncidentCategory(incident.type || incident.category || incident.emergencyType),
      emergencyType: normalizeIncidentCategory(options.type || incident.emergencyType || incident.type || incident.category),
      responderStatus: "AWAITING_RESPONSE",
      statusHistory: [{ status: INCIDENT_STATES.DETECTED, actorName: userProfile.name, at: new Date().toISOString() }],
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
      if (user?.uid) {
        setDoc(doc(db, "users", user.uid), { protectionEnabled: next, updatedAt: serverTimestamp() }, { merge: true }).catch((protectionError) => {
          console.error("Failed to update protection setting:", protectionError);
        });
      }
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
      const normalizedStatus = normalizeIncidentState(status);
      const responders = (incident.responders || []).filter((item) => item.uid !== userProfile.uid);
      const etaSeconds = estimateEtaSeconds({ pos: userPos }, incident);
      const nextResponder = {
        uid: userProfile.uid,
        name: userProfile.name,
        role: effectiveRole,
        phone: userProfile.phone,
        eta: etaSeconds ? Math.max(1, Math.ceil(etaSeconds / 60)) : null,
        etaSeconds,
        status: normalizedStatus,
        location: { lat: userPos[0], lng: userPos[1] },
        updatedAt: new Date().toISOString(),
      };
      return {
        ...incident,
        status: normalizedStatus,
        lifecycleStage: normalizedStatus,
        assignedResponderId: status === "rejected" ? incident.assignedResponderId : userProfile.uid,
        responders: status === "rejected" ? responders : [...responders, nextResponder],
        responderStatus: status === "rejected" ? "REJECTED" : normalizedStatus,
        etaSeconds: etaSeconds || incident.etaSeconds || null,
        activity: [
          ...(incident.activity || []),
          { action: normalizedStatus, actorName: userProfile.name, role: effectiveRole, at: new Date().toISOString() },
        ],
        statusHistory: [
          ...(incident.statusHistory || []),
          { status: normalizedStatus, actorName: userProfile.name, role: effectiveRole, at: new Date().toISOString() },
        ],
        completedAt: terminalStatuses.includes(normalizedStatus) ? new Date().toISOString() : incident.completedAt,
        resolvedAt: normalizedStatus === INCIDENT_STATES.RESOLVED ? serverTimestamp() : incident.resolvedAt,
      };
    });
    const normalizedStatus = normalizeIncidentState(status);
    if (status !== "rejected") {
      setDoc(doc(db, "responders", userProfile.uid), {
        uid: userProfile.uid,
        name: userProfile.name,
        role: effectiveRole,
        assignedIncidentId: terminalStatuses.includes(normalizedStatus) ? "" : incidentId,
        status: terminalStatuses.includes(normalizedStatus) ? "AVAILABLE" : normalizedStatus,
        availability: terminalStatuses.includes(normalizedStatus) ? "AVAILABLE" : "BUSY",
        available: terminalStatuses.includes(normalizedStatus),
        liveLocation: { lat: userPos[0], lng: userPos[1], updatedAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch((responderError) => console.error("Failed to sync responder state:", responderError));
    }
    addActivity({ title: `Help ${status}`, subtitle: `${userProfile.name} marked a help request ${status}` });
  };

  const acceptIncident = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.RESPONDER_ASSIGNED);
  const rejectIncident = (incidentId) => updateIncidentWithResponder(incidentId, "rejected");
  const markArrived = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.ACTIVE_RESCUE);
  const completeIncident = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.RESOLVED);
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
      markArrived,
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
