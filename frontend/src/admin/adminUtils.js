export const INCIDENT_STATES = {
  DETECTED: "DETECTED",
  PENDING_RESPONSE: "PENDING_RESPONSE",
  RESPONDER_ASSIGNED: "RESPONDER_ASSIGNED",
  EN_ROUTE: "EN_ROUTE",
  ACTIVE_RESCUE: "ACTIVE_RESCUE",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

export const terminalIncidentStates = [INCIDENT_STATES.RESOLVED, INCIDENT_STATES.CLOSED];

export const RESPONDER_STATES = {
  OFFLINE: "OFFLINE",
  ONLINE: "ONLINE",
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  RESPONDING: "RESPONDING",
  ON_MISSION: "ON_MISSION",
};

export const responderRoles = ["helper", "police", "hospital", "fire"];

const statusAliases = {
  detected: INCIDENT_STATES.DETECTED,
  active: INCIDENT_STATES.PENDING_RESPONSE,
  assigned: INCIDENT_STATES.RESPONDER_ASSIGNED,
  accepted: INCIDENT_STATES.RESPONDER_ASSIGNED,
  enroute: INCIDENT_STATES.EN_ROUTE,
  "en-route": INCIDENT_STATES.EN_ROUTE,
  arrived: INCIDENT_STATES.ACTIVE_RESCUE,
  rescue: INCIDENT_STATES.ACTIVE_RESCUE,
  completed: INCIDENT_STATES.RESOLVED,
  resolved: INCIDENT_STATES.RESOLVED,
  closed: INCIDENT_STATES.CLOSED,
};

export function normalizeIncidentCategory(value = "emergency") {
  return String(value || "emergency").trim().toLowerCase();
}

export function formatLabel(value = "") {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeIncidentState(value) {
  const raw = String(value || INCIDENT_STATES.DETECTED).trim();
  const upper = raw.toUpperCase();
  if (Object.values(INCIDENT_STATES).includes(upper)) return upper;
  return statusAliases[raw.toLowerCase()] || INCIDENT_STATES.DETECTED;
}

export function isActiveIncident(incident) {
  return !terminalIncidentStates.includes(normalizeIncidentState(incident?.status || incident?.lifecycleStage));
}

export function getIncidentType(incident) {
  return normalizeIncidentCategory(incident?.category || incident?.type || incident?.emergencyType);
}

export function getDocumentName(user) {
  return user?.verificationFileName || user?.idProofName || user?.idProofFileName || user?.selfieFileName || user?.verificationDetails?.fileName || user?.verificationDocumentUrl || user?.documentUrl || "";
}

export function getOrganization(user) {
  return user?.hospitalName || user?.stationName || user?.organization || user?.department || "";
}

export function getCity(user) {
  return user?.city || user?.verificationDetails?.city || user?.serviceCity || "";
}

export function getLicense(user) {
  return user?.governmentId || user?.badgeId || user?.badgeLicenseId || user?.licenseId || user?.registrationId || user?.officerId || user?.verificationDetails?.idNumber || "";
}

export function isVerifiedResponderRole(role) {
  return responderRoles.includes(String(role || "").toLowerCase());
}

export function getResponderDisplayName(responder) {
  return responder?.fullName || responder?.name || responder?.displayName || responder?.email || "Responder";
}

export function getResponderUnitLabel(responder) {
  return responder?.unitLabel || responder?.unit || responder?.callSign || `${formatLabel(responder?.role || "Responder")} Unit`;
}

export function getApprovalValidation(user) {
  const missing = [];
  if (!getOrganization(user)) missing.push("organization");
  if (!getCity(user)) missing.push("city");
  if (!getLicense(user)) missing.push("badge/license");
  if (!getDocumentName(user)) missing.push("verification document");
  if (!isVerifiedResponderRole(user?.role)) missing.push("verified role");
  return { valid: missing.length === 0, missing };
}

export function canApproveResponder(user) {
  return getApprovalValidation(user).valid;
}

export function normalizeResponderState(responder = {}) {
  const state = String(responder.missionState || responder.responderState || responder.availability || responder.status || "").toUpperCase();
  if (Object.values(RESPONDER_STATES).includes(state)) return state;
  if (responder.online === false) return RESPONDER_STATES.OFFLINE;
  if (responder.available === true) return RESPONDER_STATES.AVAILABLE;
  if (responder.assignedIncidentId) return RESPONDER_STATES.ON_MISSION;
  return responder.online ? RESPONDER_STATES.ONLINE : RESPONDER_STATES.OFFLINE;
}

export function isDispatchReadyResponder(responder) {
  const approval = responder?.verificationStatus === "approved" || responder?.verified === true;
  const state = normalizeResponderState(responder);
  const online = responder?.online === true || [RESPONDER_STATES.ONLINE, RESPONDER_STATES.AVAILABLE].includes(state);
  const available = responder?.available === true || state === RESPONDER_STATES.AVAILABLE || String(responder?.availability || "").toLowerCase() === "available";
  return Boolean(
    approval &&
      canApproveResponder(responder) &&
      online &&
      available &&
      !responder?.disabled &&
      !responder?.assignedIncidentId &&
      !responder?.activeIncidentId
  );
}

export function getPosition(item) {
  const loc = item?.liveLocation || item?.location || item?.victimLocation || item?.lastKnownLocation || item?.pos;
  if (Array.isArray(loc) && loc.length === 2 && Number.isFinite(Number(loc[0])) && Number.isFinite(Number(loc[1]))) return [Number(loc[0]), Number(loc[1])];
  if (loc && typeof loc === "object") {
    const lat = loc.lat ?? loc.latitude;
    const lng = loc.lng ?? loc.longitude;
    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) return [Number(lat), Number(lng)];
  }
  if (Number.isFinite(Number(item?.lat)) && Number.isFinite(Number(item?.lng))) return [Number(item.lat), Number(item.lng)];
  return null;
}

export function distanceScore(a, b) {
  const from = getPosition(a);
  const to = getPosition(b);
  if (!from || !to) return Number.POSITIVE_INFINITY;
  return haversineKm(from, to);
}

export function haversineKm(from, to) {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateEtaSeconds(responder, incident) {
  const km = distanceScore(responder, incident);
  if (!Number.isFinite(km)) return null;
  const averageEmergencyKph = Number(responder?.averageSpeedKph || 36);
  return Math.max(30, Math.round((km / Math.max(averageEmergencyKph, 5)) * 3600));
}
