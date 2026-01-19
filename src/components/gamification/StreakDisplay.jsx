import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StreakDisplay({ streak, compact = false }) {
  const getStreakColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 7) return 'from-orange-500 to-red-500';
    if (streak >= 3) return 'from-amber-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  const getStreakMessage = () => {
    if (streak >= 30) return 'Legendary!';
    if (streak >= 7) return 'On fire!';
    if (streak >= 3) return 'Keep going!';
    if (streak === 1) return 'Start of something great!';
    return 'Build your streak!';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r',
          getStreakColor(),
          'text-white shadow-sm'
        )}>
          <Flame className="w-4 h-4" />
          <span className="font-bold text-sm">{streak}</span>
        </div>
        <span className="text-xs text-slate-500">{getStreakMessage()}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative overflow-hidden rounded-2xl p-6 bg-stone-200 dark:bg-rose-900/50 border border-stone-300 dark:border-purple-500/60 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 dark:bg-rose-200/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-sm font-medium uppercase tracking-wider text-slate-700 dark:text-stone-300">Current Streak</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <motion.span
            key={streak}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold text-slate-900 dark:text-stone-100"
          >
            {streak}
          </motion.span>
          <span className="text-2xl font-medium text-slate-700 dark:text-stone-300">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
        
        <p className="text-sm mt-2 text-slate-600 dark:text-stone-200">{getStreakMessage()}</p>
        
        {/* Milestone progress */}
        {streak < 30 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-stone-300">
              <span>Next milestone</span>
              <span className="font-medium">
                {streak < 3 ? '3 days' : streak < 7 ? '7 days' : '30 days'}
              </span>
            </div>
            <div className="h-1.5 bg-stone-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(streak / (streak < 3 ? 3 : streak < 7 ? 7 : 30)) * 100}%` 
                }}
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}