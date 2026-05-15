import alertSound from "./assets/alert.mp3";
import { io } from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Login from "./login";
import HelperDashboard from "./components/HelperDashboard";
import HospitalDashboard from "./components/HospitalDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import UserDashboard from "./components/UserDashboard";
// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
function getTimeAgo(time) {
  const diff = Math.floor((Date.now() - time) / 1000);
  if (diff < 60) return "Now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  return Math.floor(diff / 3600) + " hr ago";
}
function App() {
  const showNotification = (msg) => {
    if (Notification.permission === "granted") {
      new Notification(msg);
    } else {
      Notification.requestPermission();
    }
  };
  const socket = io("http://localhost:5000");
  const hospitals = [
    { name: "Apollo Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "City Care", lat: 13.0674, lng: 80.2376 },
  ];
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);
  const [myLocation, setMyLocation] = useState(null);
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setMyLocation(newLoc);

        socket.emit("liveLocation", newLoc);
      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSOS, setCurrentSOS] = useState(null);
  const [requests, setRequests] = useState([
    { lat: 12.85, lng: 80.07, time: Date.now() },
    { lat: 12.86, lng: 80.08, time: Date.now() },
  ]);
  const helpersNearby = requests.filter(
    (r) => r.status === "pending"
  ).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      const accidentDetected = Math.random() > 0.7;

      if (accidentDetected) {
        setShowModal(true);
        return;
        sendSOS();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    socket.on("newSOS", (data) => {
      setRequests((prev) => [...prev, data]);
      showNotification("🚨 New SOS nearby!");
      setCurrentSOS(data);
      setShowModal(true);

      if (audioRef.current) {
        audioRef.current.play().catch(() => { });
      }
    });

    socket.on("statusUpdated", (data) => {
      setRequests(data);
    });

    return () => {
      socket.off("newSOS");
      socket.off("statusUpdated");
    };
  }, []);

  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  useEffect(() => {
    navigator.geolocation.watchPosition((pos) => {
      setMyLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);
  const alarm = new Audio(
    "https://www.soundjay.com/buttons/beep-01a.mp3"
  );
  <audio ref={audioRef} src={alertSound} />

  const getSOS = () => {
    setLoading(true);
    fetch("http://localhost:5000/sos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRequests(data);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false)); // ✅ STOP loading
  };

  const getSeverity = () => {
    const speed = Math.random() * 100; // simulate
    const impact = Math.random();

    if (impact > 0.7 || speed > 80) return "high";
    if (impact > 0.4) return "medium";
    return "low";
  };
  const sendSOS = () => {
    socket.emit("sendSOS", {
      lat: myLocation?.lat,
      lng: myLocation?.lng,
      time: Date.now(),
      status: "pending"
    });
  };
  const triggerSOS = () => {
    navigator.geolocation.getCurrentPosition((pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setMyLocation({ lat, lng });
      // 🔴 send to backend
      fetch("http://localhost:5000/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now(),
          lat,
          lng,
          user: user.name,
          time: Date.now(),
          status: "pending",
        }),
      });
      // 🟢 update frontend instantly
      setRequests((prev) => {
        const newReq = {
          id: Date.now(),
          lat,
          lng,
          user: user.name,
          time: Date.now(),
          status: "pending",
        };

        return [newReq, ...prev];
      });
    });
  };
  const getHospital = (severity) => {
    if (severity === "high") return "Apollo Hospital";
    if (severity === "medium") return "City Care";
    return "General Hospital";
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }
  const updateStatus = async (id, status) => {
    await fetch("http://localhost:5000/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });
  };
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div>
      <h2>Welcome, {user.name} ({user.role})</h2>

      {user.role === "helper" && (
        <HelperDashboard
          requests={requests}
          updateStatus={updateStatus}
        />
      )}

      {user.role === "hospital" && (
        <HospitalDashboard requests={requests} />
      )}

      {user.role === "police" && (
        <PoliceDashboard requests={requests} />
      )}
      {user.role === "user" && (
        <UserDashboard triggerSOS={triggerSOS} />
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
export default App;