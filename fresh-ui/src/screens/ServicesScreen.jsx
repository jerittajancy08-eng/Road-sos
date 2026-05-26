import { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation } from 'lucide-react';

export default function ServicesScreen() {
  const [services, setServices] = useState({ hospitals: [], police: [], towing: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulator fetch
    fetch('http://localhost:5000/api/nearby-services')
      .then(res => res.json())
      .then(data => {
        setServices(data.data);
        setLoading(false);
      })
      .catch((e) => {
        console.warn("Offline or Backend Down - using cached mock data", e);
        // Fallback Mock Data for Offline
        setServices({
          hospitals: [{ id: 1, name: "City Care Hospital", type: "Trauma Center", distance: "2.5 km", eta: "8 mins" }],
          police: [{ id: 1, name: "Central Police Station", distance: "3.0 km", eta: "10 mins" }],
          towing: [{ id: 1, name: "Rapid Road Assist", distance: "1.5 km", eta: "5 mins" }]
        });
        setLoading(false);
      });
  }, []);

  const ServiceCard = ({ icon, title, items, colorClass }) => (
    <div className="mb-6">
      <h3 className={`text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${colorClass}`}>
        {icon} {title}
      </h3>
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="glass-card p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-semibold">{item.name}</h4>
                {item.type && <p className="text-xs text-gray-400">{item.type}</p>}
                <div className="flex gap-3 text-xs mt-2 text-gray-300">
                  <span className="flex items-center gap-1"><Navigation size={12}/> {item.distance}</span>
                  <span className="text-neon-blue font-mono">{item.eta}</span>
                </div>
              </div>
              <button className={`p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition ${colorClass}`}>
                <Phone size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-8">
      <h1 className="text-2xl font-bold text-white mb-6 tracking-wide">Nearby Services</h1>
      
      {loading ? (
        <div className="flex justify-center mt-20 p-4">
          <div className="w-8 h-8 border-4 border-t-neon-blue border-white/10 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <ServiceCard 
            title="Hospitals & Clinics" 
            items={services.hospitals} 
            colorClass="text-neon-blue"
            icon={<MapPin size={18} />} 
          />
          <ServiceCard 
            title="Police Stations" 
            items={services.police} 
            colorClass="text-neon-green"
            icon={<MapPin size={18} />} 
          />
          <ServiceCard 
            title="Towing & Mechanics" 
            items={services.towing} 
            colorClass="text-yellow-500"
            icon={<MapPin size={18} />} 
          />
        </>
      )}
    </div>
  );
}
