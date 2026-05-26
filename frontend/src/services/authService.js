import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function getFirebaseConnectionMessage(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || error || "").toLowerCase();
  const combined = `${code} ${message}`;

  if (combined.includes("unauthorized") || combined.includes("permission-denied")) {
    return "Firebase permission denied. Check Firebase Auth and Firestore rules for this operation.";
  }

  if (combined.includes("eacces") || combined.includes("blocked") || combined.includes("permission denied")) {
    return "Network blocked: Firebase cannot connect from this network. Please allow HTTPS access to Firebase/Google services and try again.";
  }

  if (combined.includes("websocket") || combined.includes("webchannel") || combined.includes("transport errored")) {
    return "Firebase websocket failure: this network may block realtime Firebase traffic. Firestore is using long polling fallback; please try again or use another network.";
  }

  if (combined.includes("unavailable") || combined.includes("no connection established") || combined.includes("deadline-exceeded") || combined.includes("timed out")) {
    return "Firebase unavailable: the backend connection could not be established. Check your internet connection, firewall, VPN, proxy, or Firebase service availability.";
  }

  if (combined.includes("failed to fetch") || combined.includes("networkerror") || combined.includes("network error") || combined.includes("offline")) {
    return "Network blocked or offline: Firebase requests are not reaching the backend. Check your connection, firewall, VPN, or proxy settings.";
  }

  return "";
}

function normalizeFirebaseError(error) {
  const message = getFirebaseConnectionMessage(error);
  if (!message) return error;

  return new Error(message);
}

// Test Firestore connection
export async function testFirestoreConnection() {
  try {
    const testRef = doc(db, "test", "connection");
    await setDoc(testRef, {
      working: true,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    throw err;
  }
}

const roleRequirements = {
  user: ["fullName", "phone", "email", "password"],
  helper: ["governmentId", "selfieFile", "city", "phone", "email", "password"],
  police: ["fullName", "badgeId", "stationName", "officialEmail", "phone", "email", "password"],
  hospital: ["hospitalName", "registrationId", "phone", "email", "password"],
  fire: ["stationName", "officerId", "phone", "email", "password"],
};

const labels = {
  fullName: "Full name",
  phone: "Phone",
  email: "Email",
  password: "Password",
  emergencyContact: "Emergency contact",
  governmentId: "Government ID",
  selfieFile: "Selfie/photo",
  city: "City",
  badgeId: "Badge ID",
  stationName: "Station name",
  officialEmail: "Official email",
  hospitalName: "Hospital name",
  registrationId: "Registration ID",
  officerId: "Officer ID",
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";
const isMissing = (value) => (typeof File !== "undefined" && value instanceof File ? false : isBlank(value));

export function validateLogin({ email, password }) {
  if (isBlank(email)) return "Email is required.";
  if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
  if (isBlank(password)) return "Password is required.";
  if (String(password).length < 6) return "Password must be at least 6 characters.";
  return "";
}

export function validateRegistration(formData) {
  const role = formData.role || "user";
  const required = roleRequirements[role] || roleRequirements.user;
  const missing = required.find((field) => isMissing(formData[field]));

  if (missing) return `${labels[missing] || missing} is required for ${role} registration.`;
  if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email address.";
  if (!/^\+?[0-9\s()-]{7,}$/.test(String(formData.phone || ""))) return "Enter a valid phone number.";
  if (formData.officialEmail && !/\S+@\S+\.\S+/.test(formData.officialEmail)) {
    return "Enter a valid official email address.";
  }
  if (String(formData.password).length < 6) return "Password must be at least 6 characters.";
  return "";
}

export async function loginUser({ email, password }) {
  const validationError = validateLogin({ email, password });
  if (validationError) throw new Error(validationError);

  await setPersistence(auth, browserLocalPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;
  const profileSnap = await getDoc(doc(db, "users", user.uid));

  if (!profileSnap.exists()) {
    throw new Error("No RoadSOS profile exists for this account.");
  }

  const profile = { uid: user.uid, email: user.email, ...profileSnap.data() };
  const effectiveRole = profile.role || "user";
  return profile;
}

export async function loginAdmin({ email, password }) {
  const validationError = validateLogin({ email, password });
  if (validationError) throw new Error(validationError);

  await setPersistence(auth, browserLocalPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;
  const profileSnap = await getDoc(doc(db, "users", user.uid));

  if (!profileSnap.exists()) {
    // sign out any auth session started and surface a clear error
    await signOut(auth).catch(() => {});
    throw new Error("No RoadSOS profile exists for this account.");
  }

  const profile = { uid: user.uid, email: user.email, ...profileSnap.data() };

  if (!(profile.role === "admin" || profile.isAdmin === true)) {
    await signOut(auth).catch(() => {});
    throw new Error("Unauthorized admin access");
  }

  return profile;
}

export async function registerUser(formData) {

  const validationError = validateRegistration(formData);
  if (validationError) {
    throw new Error(validationError);
  }

  const selectedRole = formData.role || "user";
  const authEmail = formData.email.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
    const user = userCredential.user;

    const verificationId =
      formData.governmentId ||
      formData.badgeId ||
      formData.registrationId ||
      formData.officerId ||
      "";
    const verificationCity = formData.city || "";
    const verificationFile = formData.idProofFile || formData.selfieFile || null;
    const fullName = formData.fullName || formData.hospitalName || formData.stationName || user.email;
    const now = Date.now();

    const userData = {
      uid: user.uid,
      fullName,
      email: user.email || authEmail,
      phone: formData.phone,
      role: selectedRole,
      verificationStatus: selectedRole === "user" ? "approved" : "pending",
      verificationDetails:
        selectedRole !== "user"
          ? {
              idNumber: verificationId,
              city: verificationCity,
              fileName: verificationFile?.name || "",
            }
          : null,
      createdAt: now,
      name: fullName,
      requestedRole: selectedRole,
      verified: selectedRole === "user",
      profilePhoto: "",
      emergencyContacts: formData.emergencyContact ? [{ name: "", phone: formData.emergencyContact }] : [],
      emergencyContact: formData.emergencyContact || "",
      bloodGroup: formData.bloodGroup || "",
      allergies: formData.allergies || "",
      medicalInfo: formData.medicalInfo || "",
      protectionEnabled: true,
      liveLocation: null,
      lastKnownLocation: null,
      city: formData.city || "",
      governmentId: formData.governmentId || "",
      verificationFileName: verificationFile?.name || "",
      badgeId: formData.badgeId || "",
      stationName: formData.stationName || "",
      officialEmail: formData.officialEmail || "",
      hospitalName: formData.hospitalName || "",
      registrationId: formData.registrationId || "",
      officerId: formData.officerId || "",
      availability: false,
      updatedAt: now,
    };

    await setDoc(doc(db, "users", user.uid), userData);
    return userData;

  } catch (err) {
    throw normalizeFirebaseError(err);
  }
}

export function logoutUser() {
  return signOut(auth);
}
