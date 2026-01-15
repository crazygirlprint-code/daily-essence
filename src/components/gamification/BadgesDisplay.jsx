import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGES } from './useGamification';

export default function BadgesDisplay({ earnedBadges = [], showAll = false }) {
  const badgeEntries = Object.entries(BADGES);
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {badgeEntries.map(([key, badge], index) => {
        const isEarned = earnedBadges.includes(key);
        
        if (!showAll && !isEarned) return null;
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'relative flex flex-col items-center p-3 rounded-xl text-center transition-all',
              isEarned 
                ? 'bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 shadow-sm' 
                : 'bg-slate-50 border border-slate-200 opacity-50'
            )}
          >
            <div className={cn(
              'text-3xl mb-1',
              !isEarned && 'grayscale opacity-30'
            )}>
              {isEarned ? badge.icon : <Lock className="w-6 h-6 text-slate-300" />}
            </div>
            <p className={cn(
              'text-xs font-medium',
              isEarned ? 'text-slate-700' : 'text-slate-400'
            )}>
              {badge.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
              {badge.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}