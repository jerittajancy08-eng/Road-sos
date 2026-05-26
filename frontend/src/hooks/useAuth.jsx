import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const nextUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() };
          setUser(nextUser);
        } else {
          console.error("[RoadSOS auth]", { status: "missing-profile", uid: firebaseUser.uid });
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
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
