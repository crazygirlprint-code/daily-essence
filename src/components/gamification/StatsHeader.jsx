import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsHeader({ points, level, progressPercent, tasksToday, tasksCompleted }) {
  const completionRate = tasksToday > 0 ? Math.round((tasksCompleted / tasksToday) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-transparent rounded-lg p-5 shadow-lg shadow-purple-300/30 dark:shadow-purple-600/30 mb-6 overflow-hidden relative border border-purple-200 dark:border-purple-700 backdrop-blur-sm"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-10 h-10 rounded-lg bg-purple-300/40 dark:bg-purple-700/40 flex items-center justify-center border border-purple-400 dark:border-purple-600 flex-shrink-0"
          >
            <Trophy className="w-5 h-5 text-purple-700 dark:text-purple-200" strokeWidth={1.5} />
          </motion.div>
          
          {/* Stats */}
          <div className="flex-1">
            <p className="text-[10px] text-purple-700 dark:text-purple-300 uppercase tracking-widest font-medium">Your Progress</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-2xl font-serif text-purple-900 dark:text-purple-100">{points}</span>
              <span className="text-purple-500 dark:text-purple-400">pts</span>
              <span className="text-purple-400 dark:text-purple-600">|</span>
              <span className="text-lg font-serif text-purple-900 dark:text-purple-100">L{level}</span>
              <span className="text-purple-400 dark:text-purple-600">|</span>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-300 fill-purple-600 dark:fill-purple-300" strokeWidth={1.5} />
                <span className="text-base font-serif text-purple-900 dark:text-purple-100">{completionRate}%</span>
              </div>
            </div>
          </div>
          
          {/* Sparkle icon */}
          <Sparkles className="w-4 h-4 text-purple-400 dark:text-purple-500 flex-shrink-0 opacity-50" strokeWidth={1.5} />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-purple-400/20 dark:bg-purple-600/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 dark:from-purple-500 dark:via-purple-400 dark:to-purple-300"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}