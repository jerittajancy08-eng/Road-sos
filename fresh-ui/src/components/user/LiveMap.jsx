import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

const createDotIcon = (color) =>
  L.divIcon({
    className: "bg-transparent",
    html: `<div class="h-4 w-4 rounded-full shadow-[0_0_14px_rgba(255,255,255,0.15)]" style="background:${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export default function LiveMap({ userLocation, responders, accidentLocation, routePath, responderPosition }) {
  const responderIcon = createDotIcon("#38bdf8");
  const hospitalIcon = createDotIcon("#f97316");
  const policeIcon = createDotIcon("#60a5fa");
  const fireIcon = createDotIcon("#fb7185");
  const userIcon = createDotIcon("#2dd4bf");
  const incidentIcon = createDotIcon("#f87171");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-screen w-full"
    >
      <MapContainer center={userLocation} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />

        <Marker position={userLocation} icon={userIcon}>
          <Popup className="custom-popup">Your location</Popup>
        </Marker>

        {responders.map((responder) => {
          const icon = responder.type === "hospital" ? hospitalIcon : responder.type === "police" ? policeIcon : responder.type === "fire" ? fireIcon : userIcon;
          return (
            <Marker key={responder.id} position={[responder.lat, responder.lng]} icon={icon}>
              <Popup className="custom-popup">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-white">{responder.name}</p>
                  <p className="text-slate-300">{responder.distance}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {accidentLocation && (
          <Marker position={accidentLocation} icon={incidentIcon}>
            <Popup className="custom-popup">
              <p className="text-sm font-semibold">Detected incident</p>
            </Popup>
          </Marker>
        )}

        {responderPosition && (
          <Marker position={[responderPosition.lat, responderPosition.lng]} icon={responderIcon}>
            <Popup className="custom-popup">
              <p className="text-sm font-semibold">Responder</p>
            </Popup>
          </Marker>
        )}

        {routePath.length > 1 && <Polyline positions={routePath} pathOptions={{ color: "#38bdf8", weight: 5, opacity: 0.8 }} />}
      </MapContainer>
    </motion.div>
  );
}
