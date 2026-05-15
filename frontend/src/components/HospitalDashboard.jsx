import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function HospitalDashboard({ requests }) {
    return (
        <>
            <h3>Hospital Dashboard</h3>

            <MapContainer
                center={[13.0827, 80.2707]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {requests?.map((req, i) => (
                    <Marker key={i} position={[req.lat, req.lng]}>
                        <Popup>Patient 🚑</Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Patient List */}
            {requests?.map((req, i) => (
                <div key={i}>
                    <p>Patient: {req.user}</p>
                    <p>Severity: {req.severity}</p>
                    <p>ETA: 5 min</p>
                </div>
            ))}
        </>
    );
}
