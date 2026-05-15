import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function PoliceDashboard({ requests }) {
    return (
        <>
            <h3>Police Dashboard</h3>

            {/* ✅ MAP INSIDE RETURN */}
            <MapContainer
                center={[13.0827, 80.2707]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {requests?.map((req, i) => (
                    <Marker key={i} position={[req.lat, req.lng]}>
                        <Popup>🚨 Accident</Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* ✅ TEXT LIST */}
            {requests?.map((req, i) => (
                <div key={i}>
                    🚨 Monitoring accident at {req.lat}, {req.lng}
                </div>
            ))}
        </>
    );
}