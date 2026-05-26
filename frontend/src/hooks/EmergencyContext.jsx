import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { arrayUnion, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "./useAuth.jsx";
import { db } from "../firebase";
import { isResponderApproved, isResponderRole, normalizeRole, normalizeVerificationStatus } from "../utils/roleUtils";
import { CHENNAI_COORDINATES, isValidCoordinate, isValidPosition, positionFromLatLng } from "../utils/coordinateUtils";
import { INCIDENT_STATES, estimateEtaSeconds, getPosition, normalizeIncidentCategory, normalizeIncidentState } from "../admin/adminUtils";

const EmergencyContext = createContext();

const terminalStatuses = [INCIDENT_STATES.RESOLVED, INCIDENT_STATES.ARCHIVED, INCIDENT_STATES.CLOSED];
const offlineQueueKey = "roadsos.offlineIncidentQueue";
const cachedServicesKey = "roadsos.nearbyServices";
const cachedGpsKey = "roadsos.lastKnownGps";
const cachedContactsKey = "roadsos.emergencyContacts";

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
    status: INCIDENT_STATES.BROADCASTING,
    lifecycleStage: INCIDENT_STATES.BROADCASTING,
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
    activity: [
      { action: INCIDENT_STATES.DETECTED, actorName: userProfile.name, at: now },
      { action: INCIDENT_STATES.BROADCASTING, actorName: "RoadSOS Dispatch", at: now },
    ],
    timestamp: now,
    time: Date.now(),
    etaSeconds: null,
  };
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private modes. Realtime still works when online.
  }
}

function mapsUrl(lat, lng) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

function launchSmsFallback({ contacts = [], lat, lng }) {
  const message = `RoadSOS Emergency Alert.\nUser may be in danger.\nLast known location:\n${mapsUrl(lat, lng)}`;
  const phoneList = contacts.map((contact) => contact.phone || contact.mobile || contact).filter(Boolean).join(",");
  if (!phoneList) return { launched: false, error: "No emergency contacts saved." };
  window.location.href = `sms:${encodeURIComponent(phoneList)}?&body=${encodeURIComponent(message)}`;
  return { launched: true, error: "" };
}

function serviceKind(tags = {}) {
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") return "hospital";
  if (tags.amenity === "police") return "police";
  if (tags.emergency === "ambulance_station" || tags.amenity === "ambulance_station") return "ambulance";
  if (tags.shop === "car_repair" || tags.amenity === "vehicle_inspection") return "mechanic";
  if (tags.shop === "tyres") return "puncture";
  if (tags.amenity === "fuel") return "fuel";
  if (tags.amenity === "fire_station" || tags.emergency === "fire_station") return "fire";
  return "service";
}

function distanceKm(from, to) {
  if (!from || !to) return null;
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyServices(position) {
  if (!isValidPosition(position)) return [];
  const [lat, lng] = position;
  const queryBody = `
    [out:json][timeout:12];
    (
      node(around:5000,${lat},${lng})["amenity"~"hospital|police|fuel|fire_station|ambulance_station"];
      node(around:5000,${lat},${lng})["healthcare"="hospital"];
      node(around:5000,${lat},${lng})["emergency"~"ambulance_station|fire_station"];
      node(around:5000,${lat},${lng})["shop"~"car_repair|tyres"];
      way(around:5000,${lat},${lng})["amenity"~"hospital|police|fuel|fire_station|ambulance_station"];
      way(around:5000,${lat},${lng})["healthcare"="hospital"];
      way(around:5000,${lat},${lng})["shop"~"car_repair|tyres"];
    );
    out center 30;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: queryBody,
  });
  if (!response.ok) throw new Error("Nearby service discovery unavailable.");
  const payload = await response.json();
  return (payload.elements || [])
    .map((item) => {
      const serviceLat = item.lat ?? item.center?.lat;
      const serviceLng = item.lon ?? item.center?.lon;
      const pos = positionFromLatLng(serviceLat, serviceLng);
      if (!pos) return null;
      return {
        id: String(item.id),
        name: item.tags?.name || `${serviceKind(item.tags)} service`,
        type: serviceKind(item.tags),
        phone: item.tags?.phone || item.tags?.["contact:phone"] || "",
        lat: pos[0],
        lng: pos[1],
        pos,
        distanceKm: distanceKm(position, pos),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .slice(0, 24);
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
  const [nearbyServices, setNearbyServices] = useState(() => readJson(cachedServicesKey, []));
  const [pendingOfflineIncidents, setPendingOfflineIncidents] = useState(() => readJson(offlineQueueKey, []));

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
      verificationStatus: normalizeVerificationStatus(user?.verificationStatus || (effectiveRole === "user" ? "APPROVED" : "PENDING")),
      stationName: user?.stationName || user?.hospitalName || "",
      badgeId: user?.badgeId || user?.registrationId || user?.officerId || user?.governmentId || "",
      city: user?.city || "",
      availability: user?.availability || "online",
    }),
    [user, effectiveRole],
  );
  const responderApproved = isResponderApproved(userProfile);

  useEffect(() => {
    console.log("[RoadSOS verification realtime]", { uid: user?.uid, role: effectiveRole, verificationStatus: userProfile.verificationStatus, responderApproved });
  }, [effectiveRole, responderApproved, user?.uid, userProfile.verificationStatus]);

  useEffect(() => {
    writeJson(cachedContactsKey, userProfile.emergencyContacts || []);
  }, [userProfile.emergencyContacts]);

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
        return Array.from(byId.values()).filter((item) => isResponderRole(item.role) && isResponderApproved(item) && item.pos);
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
    if (!isOnline || !user?.uid || !pendingOfflineIncidents.length) return;
    let cancelled = false;
    const syncQueuedIncidents = async () => {
      const remaining = [];
      for (const queued of pendingOfflineIncidents) {
        try {
          await setDoc(doc(db, "incidents", queued.id), {
            ...queued,
            offlineQueued: true,
            syncedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          await setDoc(doc(db, "emergency_logs", `${queued.id}-synced`), {
            incidentId: queued.id,
            userId: queued.userId,
            type: "offline_sync",
            message: "Offline SOS synced after connection returned.",
            createdAt: serverTimestamp(),
          });
        } catch (syncError) {
          console.error("Failed to sync queued SOS:", syncError);
          remaining.push(queued);
        }
      }
      if (!cancelled) {
        setPendingOfflineIncidents(remaining);
        writeJson(offlineQueueKey, remaining);
      }
    };
    syncQueuedIncidents();
    return () => {
      cancelled = true;
    };
  }, [isOnline, pendingOfflineIncidents, user?.uid]);

  useEffect(() => {
    if (!navigator.geolocation || !user?.uid) return undefined;
    const persistPosition = (position) => {
      if (!isValidCoordinate(position.coords.latitude, position.coords.longitude)) return;
      const nextPosition = [position.coords.latitude, position.coords.longitude];
      setUserPosState(nextPosition);
      writeJson(cachedGpsKey, nextPosition);
      setGpsError("");
      const locationPatch = {
        liveLocation: { lat: nextPosition[0], lng: nextPosition[1], accuracy: position.coords.accuracy || null, updatedAt: serverTimestamp() },
        lastKnownLocation: { lat: nextPosition[0], lng: nextPosition[1] },
        updatedAt: serverTimestamp(),
      };
      setDoc(doc(db, "users", user.uid), locationPatch, { merge: true }).catch((locationError) => console.error("Failed to sync user GPS:", locationError));
      if (isResponderRole(effectiveRole) && responderApproved) {
        setDoc(doc(db, "responders", user.uid), { ...locationPatch, uid: user.uid, role: effectiveRole, name: userProfile.name, verificationStatus: userProfile.verificationStatus, online: true }, { merge: true }).catch((locationError) => console.error("Failed to sync responder GPS:", locationError));
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

  useEffect(() => {
    if (!isOnline || !isValidPosition(userPos)) return undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchNearbyServices(userPos)
        .then((services) => {
          setNearbyServices(services);
          writeJson(cachedServicesKey, services);
          if (user?.uid) {
            setDoc(doc(db, "nearby_services", user.uid), {
              userId: user.uid,
              center: { lat: userPos[0], lng: userPos[1] },
              services,
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch((serviceError) => console.error("Failed to cache nearby services:", serviceError));
          }
        })
        .catch((serviceError) => {
          console.warn("Nearby service discovery using cached results:", serviceError);
        });
    }, 600);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [isOnline, user?.uid, userPos]);

  const userIncidents = useMemo(
    () => incidents.filter((incident) => incident.userId === userProfile.uid || incident.createdBy === userProfile.uid || incident.reporterId === userProfile.uid),
    [incidents, userProfile.uid],
  );

  const canReceiveHelp = isResponderRole(effectiveRole) && responderApproved;
  const dispatchQueue = canReceiveHelp ? incidents.filter(isActiveIncident) : userIncidents;
  const responderDispatchQueue = canReceiveHelp
    ? dispatchQueue.filter((incident) => !incident.assignedResponderId || incident.assignedResponderId === userProfile.uid || (incident.responders || []).some((item) => item.uid === userProfile.uid))
    : dispatchQueue;
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
    accepted: [INCIDENT_STATES.RESPONDER_ASSIGNED, INCIDENT_STATES.ACCEPTED, INCIDENT_STATES.EN_ROUTE, INCIDENT_STATES.ARRIVED, INCIDENT_STATES.ACTIVE_RESCUE, INCIDENT_STATES.TRANSPORTING, INCIDENT_STATES.RESOLVED].includes(normalizeIncidentState(responder.status)),
    reached: [INCIDENT_STATES.ARRIVED, INCIDENT_STATES.ACTIVE_RESCUE, INCIDENT_STATES.TRANSPORTING, INCIDENT_STATES.RESOLVED].includes(normalizeIncidentState(responder.status)),
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
    const incidentPayload = {
      ...incident,
      category: normalizeIncidentCategory(incident.category || incident.type || incident.emergencyType),
      type: normalizeIncidentCategory(incident.type || incident.category || incident.emergencyType),
      emergencyType: normalizeIncidentCategory(options.type || incident.emergencyType || incident.type || incident.category),
      responderStatus: "AWAITING_RESPONSE",
      userSnapshot: {
        name: userProfile.name,
        phone: userProfile.phone,
        bloodGroup: userProfile.bloodGroup,
        medicalDetails: user?.allergies || user?.medicalInfo || "",
        emergencyContacts: userProfile.emergencyContacts,
      },
      assignmentState: "UNASSIGNED",
      statusHistory: [
        { status: INCIDENT_STATES.DETECTED, actorName: userProfile.name, at: new Date().toISOString() },
        { status: INCIDENT_STATES.BROADCASTING, actorName: "RoadSOS Dispatch", at: new Date().toISOString() },
      ],
    };
    if (!isOnline) {
      const queued = [...pendingOfflineIncidents, { ...incidentPayload, offlineQueued: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      setPendingOfflineIncidents(queued);
      writeJson(offlineQueueKey, queued);
      writeJson(cachedGpsKey, [lat, lng]);
      const sms = launchSmsFallback({ contacts: userProfile.emergencyContacts || readJson(cachedContactsKey, []), lat, lng });
      setOfflineSms({ active: true, launched: sms.launched, loading: false, error: sms.error });
      addActivity({ title: "Offline SOS queued", subtitle: sms.launched ? "SMS fallback opened for emergency contacts" : sms.error, severity: "HIGH" });
      setToast({ message: "Offline SOS queued. SMS fallback is ready." });
      return incident.id;
    }
    await setDoc(doc(db, "incidents", incident.id), {
      ...incidentPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, "emergency_tracking", incident.id), {
      incidentId: incident.id,
      userId: userProfile.uid,
      userLocation: { lat, lng },
      responderLocation: null,
      etaSeconds: null,
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, "emergency_logs", `${incident.id}-created`), {
      incidentId: incident.id,
      userId: userProfile.uid,
      type: "incident_created",
      message: "SOS incident created from user device.",
      severity: incident.severity,
      createdAt: serverTimestamp(),
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

  const updateIncident = async (incidentId, patch) => {
    try {
      await updateDoc(doc(db, "incidents", incidentId), { ...patch, updatedAt: serverTimestamp() });
    } catch (updateError) {
      console.error("Failed to update incident:", updateError);
      setToast({ message: "Could not update incident." });
    }
  };

  const updateIncidentWithResponder = async (incidentId, status) => {
    if (isResponderRole(effectiveRole) && !responderApproved) {
      setToast({ message: "Verification pending. Dispatch access is disabled." });
      return;
    }
    const incident = incidents.find((incident) => incident.id === incidentId);
    if (!incident) {
      setToast({ message: "Incident not found." });
      return;
    }
    const normalizedStatus = normalizeIncidentState(status);
    const now = new Date().toISOString();
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
      updatedAt: now,
    };
    const isRejected = normalizedStatus === INCIDENT_STATES.REJECTED;
    const isResolved = normalizedStatus === INCIDENT_STATES.RESOLVED;
    const incidentPatch = {
      status: normalizedStatus,
      lifecycleStage: normalizedStatus,
      assignedResponderId: isRejected ? "" : userProfile.uid,
      assignedResponderName: isRejected ? "" : userProfile.name,
      assignedResponderRole: isRejected ? "" : effectiveRole,
      responders: isRejected ? responders : [...responders, nextResponder],
      responderStatus: isRejected ? "REJECTED" : normalizedStatus,
      assignmentState: isRejected ? "UNASSIGNED" : "LOCKED",
      etaSeconds: etaSeconds || incident.etaSeconds || null,
      ...(normalizedStatus === INCIDENT_STATES.EN_ROUTE ? { routeStartedAt: now } : {}),
      ...(normalizedStatus === INCIDENT_STATES.ARRIVED ? { arrivedAt: now } : {}),
      ...(isResolved ? { resolvedAt: now } : {}),
      ...(terminalStatuses.includes(normalizedStatus) ? { completedAt: now } : {}),
      activity: arrayUnion({ action: normalizedStatus, actorName: userProfile.name, role: effectiveRole, at: now }),
      statusHistory: arrayUnion({ status: normalizedStatus, actorName: userProfile.name, role: effectiveRole, at: now }),
    };
    await updateIncident(incidentId, incidentPatch);
    if (!isRejected) {
      await updateDoc(doc(db, "responders", userProfile.uid), {
        uid: userProfile.uid,
        name: userProfile.name,
        role: effectiveRole,
        assignedIncidentId: terminalStatuses.includes(normalizedStatus) ? "" : incidentId,
        assignedResponderRole: effectiveRole,
        assignedResponderName: userProfile.name,
        status: terminalStatuses.includes(normalizedStatus) ? "AVAILABLE" : normalizedStatus,
        availability: terminalStatuses.includes(normalizedStatus) ? "AVAILABLE" : "BUSY",
        available: terminalStatuses.includes(normalizedStatus),
        liveLocation: { lat: userPos[0], lng: userPos[1], updatedAt: serverTimestamp() },
        updatedAt: serverTimestamp(),
      }).catch((responderError) => console.error("Failed to sync responder state:", responderError));
      await updateDoc(doc(db, "responder_assignments", `${incidentId}-${userProfile.uid}`), {
        incidentId,
        responderId: userProfile.uid,
        responderName: userProfile.name,
        responderRole: effectiveRole,
        status: normalizedStatus,
        location: { lat: userPos[0], lng: userPos[1] },
        updatedAt: serverTimestamp(),
      }).catch((assignmentError) => console.error("Failed to sync assignment:", assignmentError));
      await updateDoc(doc(db, "emergency_tracking", incidentId), {
        incidentId,
        responderId: userProfile.uid,
        responderLocation: { lat: userPos[0], lng: userPos[1] },
        etaSeconds: etaSeconds || null,
        updatedAt: serverTimestamp(),
      }).catch((trackingError) => console.error("Failed to sync tracking:", trackingError));
    } else {
      await updateDoc(doc(db, "emergency_tracking", incidentId), {
        responderId: "",
        responderLocation: null,
        etaSeconds: null,
        updatedAt: serverTimestamp(),
      }).catch((trackingError) => console.error("Failed to clear tracking on rejection:", trackingError));
    }
    await setDoc(doc(db, "emergency_logs", `${incidentId}-${userProfile.uid}-${Date.now()}`), {
      incidentId,
      responderId: userProfile.uid,
      responderName: userProfile.name,
      responderRole: effectiveRole,
      type: "responder_status",
      status: normalizedStatus,
      createdAt: serverTimestamp(),
    }).catch((logError) => console.error("Failed to sync emergency log:", logError));
    addActivity({ title: `Responder status updated`, subtitle: `${userProfile.name} updated incident status to ${normalizedStatus}`, severity: "INFO" });
  };

  const acceptIncident = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.ACCEPTED);
  const rejectIncident = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.REJECTED);
  const markEnRoute = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.EN_ROUTE);
  const markArrived = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.ARRIVED);
  const startTransport = (incidentId) => updateIncidentWithResponder(incidentId, INCIDENT_STATES.TRANSPORTING);
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
      dispatchQueue: responderDispatchQueue,
      allDispatchIncidents: dispatchQueue,
      incidents,
      activityLog,
      currentUserRole: effectiveRole,
      userProfile,
      activeIncident,
      activeRoute: activeIncident ? [activeIncident.pos, userPos] : null,
      toast,
      offlineSms,
      nearbyServices,
      pendingOfflineIncidents,
      emergencyLiteMode: !isOnline || pendingOfflineIncidents.length > 0,
      triggerSOS,
      triggerGlobalEmergency,
      toggleProtection,
      assignResponderToIncident,
      acceptIncident,
      rejectIncident,
      updateIncidentStatus,
      completeIncident,
      markEnRoute,
      markArrived,
      startTransport,
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
      responderDispatchQueue,
      incidents,
      responders,
      activityLog,
      effectiveRole,
      userProfile,
      toast,
      offlineSms,
      nearbyServices,
      pendingOfflineIncidents,
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
