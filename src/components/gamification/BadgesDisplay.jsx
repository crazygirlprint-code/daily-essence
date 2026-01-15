import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGES } from './useGamification';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'planning', label: 'Planning' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'streaks', label: 'Streaks' },
  { id: 'levels', label: 'Levels' },
  { id: 'special', label: 'Special' },
];

export default function BadgesDisplay({ earnedBadges = [], showAll = false, showFilter = false }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const badgeEntries = Object.entries(BADGES);
  
  const filteredBadges = badgeEntries.filter(([key, badge]) => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    if (!showAll && !earnedBadges.includes(key)) return false;
    return true;
  });
  
  const earnedCount = earnedBadges.length;
  const totalCount = badgeEntries.length;
  
  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-800">{earnedCount}</span>
          <span className="text-slate-400">/ {totalCount} unlocked</span>
        </div>
        <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
            className="h-full bg-gradient-to-r from-amber-400 to-rose-400"
          />
        </div>
      </div>
      
      {/* Category Filter */}
      {showFilter && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Badges Grid */}
      <div className="grid grid-cols-3 gap-3">
        {filteredBadges.map(([key, badge], index) => {
          const isEarned = earnedBadges.includes(key);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                'relative flex flex-col items-center p-3 rounded-2xl text-center transition-all cursor-pointer',
                isEarned 
                  ? 'bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 border-2 border-amber-200 shadow-lg shadow-amber-100' 
                  : 'bg-slate-50 border-2 border-slate-100'
              )}
            >
              {/* Glow effect for earned badges */}
              {isEarned && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-2xl" />
              )}
              
              <div className={cn(
                'relative text-4xl mb-2',
                !isEarned && 'grayscale opacity-30'
              )}>
                {isEarned ? badge.icon : <Lock className="w-8 h-8 text-slate-300" />}
              </div>
              <p className={cn(
                'text-xs font-semibold relative',
                isEarned ? 'text-slate-700' : 'text-slate-400'
              )}>
                {badge.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 relative">
                {badge.description}
              </p>
              
              {/* Earned indicator */}
              {isEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}