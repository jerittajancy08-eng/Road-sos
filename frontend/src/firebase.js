import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnb2SEdxod5cDa2AGIRDP9NijLUZucZFY",
  authDomain: "roadsos-c990a.firebaseapp.com",
  projectId: "roadsos-c990a",
  messagingSenderId: "394592853889",
  appId: "1:394592853889:web:dbdf81b251f942c45ad280",
  measurementId: "G-RBYJPX99HK",
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (error) {
  throw error;
}

export { auth, db };
export default app;
