import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Sparkles } from 'lucide-react';

export default function PointsPopup({ points, show, onComplete, message }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 blur-xl opacity-50" />
            
            {/* Main popup */}
            <div className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-amber-500/30">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                </motion.div>
                <div>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [0.5, 1.2, 1] }}
                    className="font-bold text-2xl bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent"
                  >
                    +{points}
                  </motion.p>
                  <p className="text-xs text-white/60">{message || 'Points earned!'}</p>
                </div>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            
            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0 }}
                animate={{ 
                  opacity: 0, 
                  y: -50 - Math.random() * 30,
                  x: (Math.random() - 0.5) * 80
                }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2"
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}