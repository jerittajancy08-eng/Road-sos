import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { loginUser, registerUser, logoutUser } from "../services/authService";

const AuthContext = createContext({
  user: null,
  authLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("[RoadSOS auth profile]", { uid: firebaseUser.uid, verificationStatus: data.verificationStatus, role: data.role });
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...data });
          } else {
            console.error("[RoadSOS auth]", { status: "missing-profile", uid: firebaseUser.uid });
            setUser(null);
          }
          setAuthLoading(false);
        },
        (error) => {
          console.error("Failed to load user profile:", error);
          setUser(null);
          setAuthLoading(false);
        },
      );
    });

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const login = async (credentials) => {
    const profile = await loginUser(credentials);
    setUser(profile);
    return profile;
  };

  const register = async (formData) => {
    const profile = await registerUser(formData);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, authLoading, login, register, logout }),
    [user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
