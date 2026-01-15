import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Trophy } from 'lucide-react';

export default function PointsPopup({ points, show, onComplete }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
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
          <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <Zap className="w-5 h-5 fill-white" />
            <span className="font-bold text-lg">+{points} points!</span>
            <Star className="w-5 h-5 fill-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}