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
      className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-5 text-white shadow-2xl mb-6 overflow-hidden relative"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-400/20 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Top row - Points and Level */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-200 text-xs font-medium uppercase tracking-wider">Level {level}</p>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-bold">{points.toLocaleString()}</span>
                <span className="text-white/50 text-sm">pts</span>
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
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{completionRate}%</span>
            </div>
          </div>
        </div>
        
        {/* Progress to next level */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Progress to Level {level + 1}</span>
            <span className="text-amber-300 font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-amber-300 rounded-full"
            />
          </div>
        </div>
        
        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{tasksCompleted}</p>
            <p className="text-xs text-white/50">Done Today</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl font-bold text-rose-400">{tasksToday - tasksCompleted}</p>
            <p className="text-xs text-white/50">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">+10</p>
            <p className="text-xs text-white/50">Per Task</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}