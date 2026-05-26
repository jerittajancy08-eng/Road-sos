import { useState, useEffect } from 'react';

const defaultProfile = {
  name: 'Aman Sharma',
  age: '25',
  bloodGroup: 'O+',
  allergies: 'Penicillin',
  emergencyContactName: 'Rahul Sharma',
  emergencyContactPhone: '+91 98765 43210'
};

export function useProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('roadsos-profile');
      if (saved) return JSON.parse(saved);
      // set default immediately if nothing in storage
      localStorage.setItem('roadsos-profile', JSON.stringify(defaultProfile));
      return defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('roadsos-profile', JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not save profile safely to local storage", e);
    }
  }, [profile]);

  return [profile, setProfile];
}
