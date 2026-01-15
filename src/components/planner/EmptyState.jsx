import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coffee, CheckCircle2 } from 'lucide-react';

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
        <p className="text-slate-500 max-w-xs">
          You've completed all your tasks. Time for a well-deserved break! ☕
        </p>
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
      <p className="text-slate-500 max-w-xs">
        Your day is clear! Add some tasks to get organized.
      </p>
    </motion.div>
  );
}