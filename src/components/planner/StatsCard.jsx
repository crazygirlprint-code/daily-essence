import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react';

export default function StatsCard({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-3xl p-6 border border-rose-100/50 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">Today's Progress</h3>
        <span className="text-2xl font-bold text-rose-500">{progress}%</span>
      </div>
      
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-800">{completed}</p>
          <p className="text-xs text-slate-500">Done</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 mb-2">
            <Circle className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{pending}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 mb-2">
            <Flame className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">{highPriority}</p>
          <p className="text-xs text-slate-500">Urgent</p>
        </div>
      </div>
    </motion.div>
  );
}