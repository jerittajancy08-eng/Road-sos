import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  // backend check
  useEffect(() => {
    fetch("https://road-sos.onrender.com")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(() => setMessage("Backend not reachable"));
  }, []);

  // ✅ SOS FUNCTION (THIS WAS MISSING)
  const sendSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const data = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        time: new Date().toLocaleString()
      };

      fetch("https://road-sos.onrender.com/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(() => alert("🚨 SOS SENT SUCCESSFULLY"))
        .catch(() => alert("❌ Failed to send SOS"));
    });
  };

  return (
    <div style={{
      height: "100vh",
      background: "#0b1220",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>

      <h1>🚑 Road SOS</h1>
      <p>{message}</p>

      <button
        onClick={sendSOS}
        style={{
          marginTop: "40px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "red",
          color: "white",
          fontSize: "24px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 30px red"
        }}
      >
        SOS
      </button>

    </div>
  );
}

export default App;