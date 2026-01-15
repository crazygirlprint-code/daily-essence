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
      className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-black rounded-lg p-5 text-stone-100 shadow-lg mb-6 overflow-hidden relative border border-stone-700"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-700/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-800/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Top row - Points and Level */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-700/20 flex items-center justify-center border border-amber-700/30">
              <Trophy className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-amber-400 text-[10px] font-medium uppercase tracking-widest">Level {level}</p>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={1.5} />
                <span className="text-2xl font-serif">{points.toLocaleString()}</span>
                <span className="text-stone-400 text-xs uppercase tracking-widest">pts</span>
              </div>
            </div>
          </div>
          
          {/* Completion Rate Circle */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - completionRate / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-serif">{completionRate}%</span>
            </div>
          </div>
        </div>
        
        {/* Progress to next level */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-stone-400 uppercase tracking-widest text-[10px]">Progress to Level {level + 1}</span>
            <span className="text-amber-400 font-serif">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            />
          </div>
        </div>
        
        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-700">
          <div className="text-center">
            <p className="text-2xl font-serif text-amber-300">{tasksCompleted}</p>
            <p className="text-[9px] text-stone-400 uppercase tracking-widest">Done Today</p>
          </div>
          <div className="text-center border-x border-stone-700">
            <p className="text-2xl font-serif text-stone-300">{tasksToday - tasksCompleted}</p>
            <p className="text-[9px] text-stone-400 uppercase tracking-widest">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-amber-300">+10</p>
            <p className="text-[9px] text-stone-400 uppercase tracking-widest">Per Task</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}