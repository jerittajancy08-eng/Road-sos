import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

const getServiceIcon = (type) => {
  const palette = {
    hospital: "#f97316",
    police: "#38bdf8",
    fire: "#fb7185",
  };
  return L.divIcon({
    className: "bg-transparent",
    html: `<div class="h-4 w-4 rounded-full border border-white/30 shadow-[0_0_14px_rgba(255,255,255,0.12)]" style="background:${palette[type] || '#60a5fa'}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export default function LiveMapSection({ location, services, routePath, movingResponder }) {
  const mapPath = movingResponder ? [[movingResponder.lat, movingResponder.lng], location] : routePath;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="border-b border-white/10 bg-slate-950/80 px-5 py-4 text-sm font-semibold text-slate-100">Live map</div>
      <div className="h-[420px] sm:h-[480px] w-full bg-slate-950">
        <MapContainer center={location} zoom={13} zoomControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
          <Marker position={location} icon={L.divIcon({ className: 'bg-transparent', html: '<div class="h-4 w-4 rounded-full border border-white/40 bg-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.35)]"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })}>
            <Popup className="custom-popup">Your location</Popup>
          </Marker>
          {services.map((service) => (
            <Marker key={service.id} position={[service.lat, service.lng]} icon={getServiceIcon(service.type)}>
              <Popup className="custom-popup"><span className="font-semibold">{service.name}</span></Popup>
            </Marker>
          ))}
          {mapPath.length > 0 && <Polyline positions={mapPath} pathOptions={{ color: "#38bdf8", weight: 5, opacity: 0.8 }} />}
        </MapContainer>
      </div>
    </motion.div>
  );
}
