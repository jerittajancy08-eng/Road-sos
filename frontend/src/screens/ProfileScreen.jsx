import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { User, Activity, Edit3, Save, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileScreen() {
  const [profile, setProfile] = useProfile();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [showSaved, setShowSaved] = useState(false);
  const [autoShare, setAutoShare] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setProfile(formData);
    setEditMode(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="p-4 pt-8 pb-20 fade-in h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Patient Profile</h1>
          <p className="text-xs text-gray-400 mt-1">Encrypted Emergency Data Link</p>
        </div>
        <button 
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
             editMode ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 shadow-[0_0_15px_rgba(0,255,102,0.3)]' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {editMode ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
        </button>
      </div>

      {showSaved && (
         <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs font-bold text-center py-2 rounded-lg mb-6 shadow-[0_0_10px_rgba(0,255,102,0.2)]"
         >
           Profile secured for emergency use
         </motion.div>
      )}

      {/* Profile Form / View */}
      <div className="flex flex-col gap-4">
        
        {/* Personal Details */}
        <div className="glass-panel p-5 border-white/5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-neon-blue/10 rounded-full blur-xl"></div>
          <h2 className="text-[10px] uppercase font-bold text-neon-blue tracking-widest mb-4 flex items-center gap-2">
            <User size={12} /> Personal Baseline
          </h2>
          
          <div className="space-y-4 relative z-10">
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                {editMode ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-neon-blue/50 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 transition-all font-bold" />
                ) : (
                  <p className="text-white font-bold">{profile.name}</p>
                )}
             </div>
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Age</label>
                {editMode ? (
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-neon-blue/50 focus:outline-none focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono" />
                ) : (
                  <p className="text-white font-mono">{profile.age} Years</p>
                )}
             </div>
          </div>
        </div>

        {/* Medical Intel */}
        <div className="glass-panel p-5 border-red-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
          <h2 className="text-[10px] uppercase font-bold text-red-400 tracking-widest mb-4 flex items-center gap-2">
            <Activity size={12} /> Critical Medical Intel
          </h2>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Blood Group</label>
                {editMode ? (
                  <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 rounded-lg p-2 text-red-100 text-sm focus:border-red-500 focus:outline-none font-mono font-bold uppercase transition-all shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]" />
                ) : (
                  <p className="text-white font-mono font-bold flex items-center gap-2">
                     <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(220,38,38,0.3)]">{profile.bloodGroup}</span>
                  </p>
                )}
             </div>
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Severe Allergies</label>
                {editMode ? (
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="w-full bg-black/50 border border-red-500/30 rounded-lg p-2 text-red-100 text-sm focus:border-red-500 focus:outline-none font-mono font-bold transition-all shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]" />
                ) : (
                  <p className="text-red-300 font-mono text-sm max-w-[120px] truncate">{profile.allergies}</p>
                )}
             </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass-panel p-5 border-yellow-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl"></div>
          <h2 className="text-[10px] uppercase font-bold text-yellow-500 tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert size={12} /> Auto-Notify Contact
          </h2>
          
          <div className="space-y-4 relative z-10">
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Contact Name</label>
                {editMode ? (
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-bold" />
                ) : (
                  <p className="text-white font-bold">{profile.emergencyContactName}</p>
                )}
             </div>
             <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label>
                {editMode ? (
                  <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-mono" />
                ) : (
                  <p className="text-white font-mono opacity-80">{profile.emergencyContactPhone}</p>
                )}
             </div>
          </div>
        </div>

      </div>

      {!editMode && (
         <div className="mt-6 flex flex-col gap-3">
           <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center justify-between">
              <span className="text-xs text-white font-medium">Enable auto-share in emergencies</span>
              <div 
                 onClick={() => setAutoShare(!autoShare)}
                 className={`w-10 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-all ${autoShare ? 'bg-neon-green' : 'bg-gray-600'}`}
              >
                 <motion.div 
                   layout 
                   className="w-4 h-4 bg-white rounded-full" 
                   animate={{ x: autoShare ? 20 : 0 }} 
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                 />
              </div>
           </div>
           
           <p className="text-[10px] text-gray-500 text-center leading-relaxed flex items-center justify-center gap-1.5 px-4 bg-blue-900/10 py-2 rounded-lg border border-blue-500/20">
              <ShieldAlert size={12} className="text-neon-blue" />
              🔒 Data stored locally. Shared only during emergencies.
           </p>
         </div>
      )}
    </div>
  );
}
