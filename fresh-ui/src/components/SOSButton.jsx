import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SOSButton({ onTrigger }) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef(null);
  const progressTimer = useRef(null);

  const HOLD_DURATION = 2000; // 2 seconds

  const startHold = () => {
    setIsHolding(true);
    setProgress(0);
    
    // Animate progress ring
    let startTime = Date.now();
    progressTimer.current = setInterval(() => {
      let elapsed = Date.now() - startTime;
      let percent = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(percent);
    }, 20);

    holdTimer.current = setTimeout(() => {
      clearInterval(progressTimer.current);
      onTrigger();
      setIsHolding(false);
      setProgress(100);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    clearTimeout(holdTimer.current);
    clearInterval(progressTimer.current);
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-64 mx-auto my-6">
      {/* Dynamic Progress Ring */}
      <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="rgba(255, 51, 102, 0.15)" 
          strokeWidth="4" 
        />
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="#FF3366" 
          strokeWidth="4" 
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * progress) / 100}
          className={`transition-all ${isHolding ? 'duration-75' : 'duration-300'}`}
          style={{ filter: `drop-shadow(0 0 ${progress/10}px #FF3366)` }}
        />
      </svg>

      <motion.button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-44 h-44 rounded-full flex flex-col items-center justify-center z-10 transition-colors duration-200 ${
          isHolding 
            ? 'bg-red-600 shadow-[0_0_60px_rgba(255,51,102,0.8)] scale-95 border-4 border-red-400' 
            : 'bg-[#FF3366] neon-glow-red hover:bg-red-500 hover:shadow-[0_0_40px_rgba(255,51,102,0.6)]'
        }`}
      >
        <span className="text-4xl font-black text-white tracking-widest mb-1 shadow-black/50 drop-shadow-lg">SOS</span>
        <span className={`text-xs font-bold uppercase tracking-widest transition-opacity ${isHolding ? 'text-white' : 'text-white/80'}`}>
          {isHolding ? 'HOLDING...' : 'HOLD 2 SEC'}
        </span>
      </motion.button>
      
      {/* Background Pulse ripples */}
      <AnimatePresence>
        {!isHolding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full border border-red-500/30 animate-ping pointer-events-none"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
