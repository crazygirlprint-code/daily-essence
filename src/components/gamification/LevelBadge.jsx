import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LevelBadge({ level, points, progressPercent, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-rose-100 px-3 py-1.5 rounded-full">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-sm font-bold text-amber-700">Lvl {level}</span>
        <span className="text-xs text-amber-600">{points} pts</span>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-500/60"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Level</p>
            <p className="text-lg font-bold text-slate-800">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-600">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span className="font-bold">{points}</span>
          </div>
          <p className="text-xs text-slate-400">total points</p>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress to Level {level + 1}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}