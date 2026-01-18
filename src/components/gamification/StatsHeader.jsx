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
          {/* Icon and Progress */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-lg bg-purple-300/40 dark:bg-purple-700/40 flex items-center justify-center border border-purple-400 dark:border-purple-600 flex-shrink-0"
            >
              <Trophy className="w-5 h-5 text-purple-700 dark:text-purple-200" strokeWidth={1.5} />
            </motion.div>
            
            <div className="flex-1">
              <p className="text-[10px] text-purple-700 dark:text-purple-300 uppercase tracking-widest font-medium">Your Progress</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-serif text-purple-900 dark:text-purple-100">{points}</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 uppercase">pts</span>
                </div>
                <span className="text-purple-400 dark:text-purple-600">|</span>
                <span className="text-sm font-serif text-purple-900 dark:text-purple-100">L{level}</span>
                <span className="text-purple-400 dark:text-purple-600">|</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300 fill-purple-600 dark:fill-purple-300" strokeWidth={2} />
                  <span className="text-sm font-serif text-purple-900 dark:text-purple-100">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-purple-300/30 dark:bg-purple-600/30 rounded-full overflow-hidden border border-purple-400 dark:border-purple-600">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}