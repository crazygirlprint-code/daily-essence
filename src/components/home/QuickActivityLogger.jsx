import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import ActivityLogger from '@/components/activity/ActivityLogger';

const activityQuickActions = [
  { type: 'mindful_walking', emoji: '🚶', label: 'Walk' },
  { type: 'journaling', emoji: '📝', label: 'Journal' },
  { type: 'social_connection', emoji: '👥', label: 'Connect' },
  { type: 'healthy_meal', emoji: '🥗', label: 'Meal' },
  { type: 'creative_hobby', emoji: '🎨', label: 'Create' },
];

export default function QuickActivityLogger({ onActivityLogged }) {
  const [showLogger, setShowLogger] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleQuickLog = (type) => {
    setSelectedType(type);
    setShowLogger(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-800 dark-luxury:from-slate-800 dark-luxury:to-blue-900 rounded-xl p-6 border border-amber-200/50 dark:border-neutral-700 dark-luxury:border-amber-600/30"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-slate-900 dark:text-stone-100">Quick Activity Log</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {activityQuickActions.map((activity) => (
            <button
              key={activity.type}
              onClick={() => handleQuickLog(activity.type)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <span className="text-2xl">{activity.emoji}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-stone-300">{activity.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {showLogger && (
        <ActivityLogger
          preselectedType={selectedType}
          onSubmit={(data) => {
            onActivityLogged?.(data);
            setShowLogger(false);
            setSelectedType(null);
          }}
          onClose={() => {
            setShowLogger(false);
            setSelectedType(null);
          }}
        />
      )}
    </>
  );
}