import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth.jsx";

function mapUserToProfile(user) {
  if (!user) {
    return {
      name: "",
      age: "",
      bloodGroup: "",
      allergies: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    };
  }

  return {
    name: user.fullName || user.name || "",
    age: user.age || "",
    bloodGroup: user.bloodGroup || "",
    allergies: user.allergies || user.medicalInfo || "",
    emergencyContactName: user.emergencyContacts?.[0]?.name || user.emergencyContactName || "",
    emergencyContactPhone: user.emergencyContacts?.[0]?.phone || user.emergencyPhone || user.emergencyContact || "",
  };
}

export function useProfile() {
  const { user } = useAuth();
  const profile = mapUserToProfile(user);

  const setProfile = async (nextProfile) => {
    if (!user?.uid) return;
    await updateDoc(doc(db, "users", user.uid), {
      fullName: nextProfile.name || "",
      name: nextProfile.name || "",
      age: nextProfile.age || "",
      bloodGroup: nextProfile.bloodGroup || "",
      allergies: nextProfile.allergies || "",
      medicalInfo: nextProfile.allergies || "",
      emergencyContacts: nextProfile.emergencyContactName || nextProfile.emergencyContactPhone
        ? [{ name: nextProfile.emergencyContactName || "", phone: nextProfile.emergencyContactPhone || "" }]
        : [],
      emergencyContactName: nextProfile.emergencyContactName || "",
      emergencyPhone: nextProfile.emergencyContactPhone || "",
      emergencyContact: nextProfile.emergencyContactPhone || "",
      updatedAt: serverTimestamp(),
    });
  };

  return [profile, setProfile];
}
