import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function HelperDashboard({ requests }) {
    return (
        <div>
            <h2>Nearby Help Requests</h2>

            {/* ✅ MAP */}
            <MapContainer
                center={[13.0827, 80.2707]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {requests.map((req, i) => (
                    <Marker key={i} position={[req.lat, req.lng]}>
                        <Popup>Help Needed 🚨</Popup>
                    </Marker>
                ))}
            </MapContainer>
            {/* EXISTING REQUESTS */}
            {requests.map((r, i) => (
                <div key={i}>
                    <p>Patient: {r.user || "Unknown"}</p>
                    <p>Severity: {r.severity || "Low"}</p>
                    <button>Accept</button>
                </div>
            ))}
        </div>
    );
}

export default HelperDashboard;