import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onCancel, onConfirm }) {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isOpen && timeLeft === 0) {
      onConfirm();
    }
    
    if (!isOpen) {
      setTimeLeft(10); // reset
    }

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm glass-panel p-6 text-center border-red-500/30"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 pulse-animation">
              <ShieldAlert className="text-neon-red w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Are you safe?</h2>
            <p className="text-gray-400 text-sm mb-6">
              A potential accident was detected. Emergency SOS will be triggered automatically if you don't respond.
            </p>

            <div className="text-5xl font-mono font-bold text-neon-red mb-8">
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onCancel}
                className="w-full py-3.5 rounded-xl bg-neon-green/20 text-neon-green border border-neon-green/50 font-bold flex items-center justify-center gap-2 hover:bg-neon-green/30 transition-all font-poppins"
              >
                <CheckCircle2 size={20} />
                I am Safe (Cancel)
              </button>
              <button 
                onClick={onConfirm}
                className="w-full py-3.5 rounded-xl bg-neon-red text-white font-bold hover:bg-red-600 transition-all font-poppins shadow-lg neon-glow-red"
              >
                Trigger SOS Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
