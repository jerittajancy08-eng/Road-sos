export const responderRoles = ["helper", "police", "hospital", "fire"];

export const roleBasePath = {
  user: "/user",
  helper: "/helper",
  police: "/police",
  hospital: "/hospital",
  fire: "/fire",
};

export const dispatchTitles = {
  helper: "Helper Dispatch",
  police: "Police Dispatch",
  hospital: "Hospital Response",
  fire: "Fire Rescue Dispatch",
};

export const profileTitles = {
  helper: "Helper Profile",
  police: "Police Profile",
  hospital: "Hospital Profile",
  fire: "Fire Rescue Profile",
};

export function normalizeRole(role) {
  const value = String(role || "user").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (value === "fire_rescue" || value === "firefighter" || value === "fire_department") return "fire";
  if (value === "medical" || value === "ambulance" || value === "hospital_admin") return "hospital";
  if (value === "police_officer") return "police";
  if (value === "responder" || value === "volunteer") return "helper";
  if (value === "admin") return "admin";
  if (responderRoles.includes(value)) return value;
  return "user";
}

export function isResponderRole(role) {
  return responderRoles.includes(normalizeRole(role));
}

export function getRoleHomePath(role = "user") {
  const safeRole = normalizeRole(role);
  return `${roleBasePath[safeRole] || roleBasePath.user}/home`;
}

export function getRoleBasePath(role = "user") {
  const safeRole = normalizeRole(role);
  return roleBasePath[safeRole] || roleBasePath.user;
}

export function isResponderApproved(profile) {
  if (!isResponderRole(profile?.role)) return true;
  return profile?.verificationStatus === "approved" || profile?.verified === true;
}

export function displayRole(role = "user") {
  const safeRole = normalizeRole(role);
  if (safeRole === "fire") return "Fire Rescue";
  return String(safeRole || "user").replace(/^\w/, (letter) => letter.toUpperCase());
}
