import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import LoadingMap from "../LoadingMap";
import { safePosition, isValidPosition, positionFromLatLng, validPositions } from "../../utils/coordinateUtils";

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

  const center = safePosition(userLocation);
  const safeAccidentLocation = isValidPosition(accidentLocation) ? accidentLocation : null;
  const safeResponderPosition = responderPosition ? positionFromLatLng(responderPosition.lat, responderPosition.lng) : null;
  const safeRoutePath = validPositions(routePath || []);
  const visibleResponders = (responders || [])
    .map((responder) => ({ ...responder, position: positionFromLatLng(responder.lat, responder.lng) }))
    .filter((responder) => responder.position);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-screen w-full"
    >
      {!isValidPosition(center) ? <LoadingMap /> : <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />

        <Marker position={center} icon={userIcon}>
          <Popup className="custom-popup">Your location</Popup>
        </Marker>

        {visibleResponders.map((responder) => {
          const icon = responder.type === "hospital" ? hospitalIcon : responder.type === "police" ? policeIcon : responder.type === "fire" ? fireIcon : userIcon;
          return (
            <Marker key={responder.id} position={responder.position} icon={icon}>
              <Popup className="custom-popup">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-white">{responder.name}</p>
                  <p className="text-slate-300">{responder.distance}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {safeAccidentLocation && (
          <Marker position={safeAccidentLocation} icon={incidentIcon}>
            <Popup className="custom-popup">
              <p className="text-sm font-semibold">Detected incident</p>
            </Popup>
          </Marker>
        )}

        {safeResponderPosition && (
          <Marker position={safeResponderPosition} icon={responderIcon}>
            <Popup className="custom-popup">
              <p className="text-sm font-semibold">Responder</p>
            </Popup>
          </Marker>
        )}

        {safeRoutePath.length > 1 && <Polyline positions={safeRoutePath} pathOptions={{ color: "#38bdf8", weight: 5, opacity: 0.8 }} />}
      </MapContainer>}
    </motion.div>
  );
}
