import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coffee, CheckCircle2, Heart, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyState({ type = 'no-tasks' }) {
  if (type === 'all-done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">All done!</h3>
        <p className="text-slate-500 max-w-xs mb-4">
          You've completed all your tasks. Time for a well-deserved break!
        </p>
        <div className="flex gap-3">
          <Link to={createPageUrl('Affirmations')}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-900 rounded-lg text-sm font-medium border border-amber-300 hover:bg-amber-200 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Daily Affirmation
            </motion.button>
          </Link>
          <Link to={createPageUrl('SelfCare')}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-lg text-sm font-medium border border-stone-300 hover:bg-stone-200 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Self-Care
            </motion.button>
          </Link>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
        <Coffee className="w-10 h-10 text-rose-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">No tasks yet</h3>
      <p className="text-slate-500 max-w-xs mb-4">
        Start your day fresh! Here are some suggestions:
      </p>
      <div className="flex gap-3">
        <Link to={createPageUrl('Meditation')}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 rounded-lg text-sm font-medium border border-neutral-300 hover:bg-neutral-200 transition-colors"
          >
            <Leaf className="w-4 h-4" />
            Meditate
          </motion.button>
        </Link>
        <Link to={createPageUrl('Calendar')}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-lg text-sm font-medium border border-stone-300 hover:bg-stone-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Plan Week
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}