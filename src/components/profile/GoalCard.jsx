import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons = {
  sleep: '😴',
  stress: '🧘',
  fitness: '💪',
  nutrition: '🥗',
  mental_health: '🧠',
  social: '👥',
  other: '⭐',
};

const categoryColors = {
  sleep: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200',
  stress: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200',
  fitness: 'bg-orange-50 dark:bg-orange-950 border-orange-200',
  nutrition: 'bg-green-50 dark:bg-green-950 border-green-200',
  mental_health: 'bg-purple-50 dark:bg-purple-950 border-purple-200',
  social: 'bg-pink-50 dark:bg-pink-950 border-pink-200',
  other: 'bg-amber-50 dark:bg-amber-950 border-amber-200',
};

export default function GoalCard({ goal, onEdit, onDelete }) {
  const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-5 border-2 border-purple-200 dark:border-purple-500/60 shadow-sm bg-white/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{categoryIcons[goal.category]}</span>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-stone-100">{goal.name}</h3>
          </div>
          {goal.description && (
            <p className="text-sm text-slate-600 dark:text-stone-400">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(goal)}
            className="h-8 w-8"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-700 dark:text-stone-400">Progress</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-stone-100">{goal.current_progress}%</span>
          </div>
          <Progress value={goal.current_progress} className="h-2" />
        </div>

        {goal.target_date && (
          <div className="text-xs text-slate-600 dark:text-stone-400">
            {daysLeft > 0 ? `${daysLeft} days to target` : daysLeft === 0 ? 'Target date is today' : 'Target date passed'}
          </div>
        )}

        {goal.last_ai_insight && (
          <div className="bg-white/50 dark:bg-neutral-800/50 rounded-lg p-3 border-l-2 border-amber-500">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{goal.last_ai_insight}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}