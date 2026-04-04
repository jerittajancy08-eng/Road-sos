import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [activeEmergency, setActiveEmergency] = useState(false);
  const [phase, setPhase] = useState('INITIATED');

  // Shared Core GPS/Map States
  const [userPos, setUserPos] = useState([28.6139, 77.2090]); 
  const hospitalDest = [28.6250, 77.1950];
  const [ambPos, setAmbPos] = useState(hospitalDest);
  const [eta, setEta] = useState(120); // exact seconds synchronicity
  
  const [helpers, setHelpers] = useState([
     { id: 1, initials: 'AS', name: 'Aman S.', distance: '120m away', status: 'Alerted', accepted: false, reached: false },
     { id: 2, initials: 'PR', name: 'Priya R.', distance: '300m away', status: 'Alerted', accepted: false, reached: false },
     { id: 3, initials: 'KV', name: 'Kabir V.', distance: '500m away', status: 'Alerted', accepted: false, reached: false }
  ]);

  const tickTimer = useRef(null);

  // Global Sync Loop
  useEffect(() => {
    if (activeEmergency) {
      tickTimer.current = setInterval(() => {
          // ETA Tick
          setEta(prev => (prev > 0 ? prev - 1 : 0));
          
          // AmbPos Tick
          setAmbPos(prev => {
              const latDiff = userPos[0] - prev[0];
              const lngDiff = userPos[1] - prev[1];
              return [prev[0] + latDiff * 0.05, prev[1] + lngDiff * 0.05];
          });
      }, 1000);

      // Phase Automations
      setTimeout(() => setPhase('DISPATCHED'), 6000);
      setTimeout(() => setPhase('RESPONDING'), 14000);

      // Helper Automations
      setTimeout(() => setHelpers(h => h.map(v => v.id === 1 ? {...v, status: 'Coming to help', accepted: true} : v)), 2000);
      setTimeout(() => setHelpers(h => h.map(v => v.id === 2 ? {...v, status: 'Coming to help', accepted: true} : v)), 5000);
      setTimeout(() => setHelpers(h => h.map(v => v.id === 1 ? {...v, status: 'Reached location', reached: true} : v)), 12000);
    }

    return () => {
      clearInterval(tickTimer.current);
    };
  }, [activeEmergency]);

  const triggerGlobalEmergency = (lat, lng) => {
    if (lat && lng) setUserPos([lat, lng]);
    setActiveEmergency(true);
    setPhase('INITIATED');
    setEta(120);
    setAmbPos(hospitalDest);
    setHelpers([
       { id: 1, initials: 'AS', name: 'Aman S.', distance: '120m away', status: 'Alerted', accepted: false, reached: false },
       { id: 2, initials: 'PR', name: 'Priya R.', distance: '300m away', status: 'Alerted', accepted: false, reached: false },
       { id: 3, initials: 'KV', name: 'Kabir V.', distance: '500m away', status: 'Alerted', accepted: false, reached: false }
    ]);
  };

  const endEmergency = () => {
    setActiveEmergency(false);
    setPhase('INITIATED');
    clearInterval(tickTimer.current);
  };

  return (
    <EmergencyContext.Provider value={{ 
      activeEmergency, phase, triggerGlobalEmergency, endEmergency,
      userPos, setUserPos, ambPos, eta, helpers 
    }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export const useEmergencyContext = () => useContext(EmergencyContext);
