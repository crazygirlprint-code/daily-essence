import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sampleAds = [
  {
    id: 1,
    title: 'Premium Wellness Bundle',
    description: 'Unlock advanced features',
    cta: 'Learn More',
    color: 'from-purple-500 to-rose-500'
  },
  {
    id: 2,
    title: 'Meditation Pro',
    description: '1000+ guided sessions',
    cta: 'Explore',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    title: 'Financial Mastery Course',
    description: 'Master your money',
    cta: 'Enroll',
    color: 'from-emerald-500 to-teal-500'
  },
];

export default function AdBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAd] = useState(sampleAds[Math.floor(Math.random() * sampleAds.length)]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`bg-gradient-to-r ${currentAd.color} text-white rounded-2xl p-4 mb-6 shadow-lg relative overflow-hidden`}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{currentAd.title}</h3>
              <p className="text-sm text-white/80">{currentAd.description}</p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 ml-4"
              aria-label="Close ad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-sm transition-colors">
            {currentAd.cta}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}