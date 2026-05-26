import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export function useAdminCollection(collectionName, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const source = options.orderBy
      ? query(collection(db, collectionName), orderBy(options.orderBy, options.direction || "desc"))
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(
      source,
      (snapshot) => {
        setItems(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, options.direction, options.orderBy]);

  return { items, loading, error };
}

export function isResponderRole(role) {
  return ["helper", "police", "hospital", "fire"].includes(role);
}

export function formatTimestamp(value) {
  if (!value) return "N/A";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  if (typeof value.toMillis === "function") return new Date(value.toMillis()).toLocaleString();
  return new Date(value).toString() === "Invalid Date" ? "N/A" : new Date(value).toLocaleString();
}
