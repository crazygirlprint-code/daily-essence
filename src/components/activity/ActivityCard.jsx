import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const activityEmojis = {
  mindful_walking: '🚶',
  journaling: '📝',
  social_connection: '👥',
  healthy_meal: '🥗',
  creative_hobby: '🎨',
  other: '✨',
};

const moodEmojis = {
  very_low: '😢',
  low: '😕',
  neutral: '😐',
  good: '🙂',
  excellent: '😄',
};

export default function ActivityCard({ activity, onDelete }) {
  const moodImproved = activity.mood_after > activity.mood_before;
  const moodValues = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 dark-luxury:bg-slate-800/50 rounded-xl p-4 border border-stone-200 dark:border-neutral-700 dark-luxury:border-amber-600/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">{activityEmojis[activity.type]}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-stone-100">{activity.title}</h3>
            <p className="text-xs text-slate-600 dark:text-stone-400 mt-1">
              {format(new Date(activity.activity_date), 'MMM d, yyyy')}
              {activity.family_member && ` • ${activity.family_member}`}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(activity.id)}
          className="h-8 w-8 text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        {activity.duration_minutes && (
          <p className="text-slate-700 dark:text-stone-300">⏱️ <span className="font-medium">{activity.duration_minutes} minutes</span></p>
        )}

        <div className="flex items-center gap-4 py-2 px-3 bg-amber-50/50 dark:bg-neutral-700/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-stone-400">Before</p>
            <span className="text-xl">{moodEmojis[activity.mood_before]}</span>
          </div>
          <div className={`flex-1 h-1 rounded-full ${moodImproved ? 'bg-green-300' : moodValues[activity.mood_after] === moodValues[activity.mood_before] ? 'bg-amber-300' : 'bg-red-300'}`} />
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-stone-400">After</p>
            <span className="text-xl">{moodEmojis[activity.mood_after]}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-700 dark:text-stone-300">Energy: <span className="font-semibold text-amber-600">{activity.energy_level}/10</span></p>
          {moodImproved && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Mood improved!</span>}
        </div>

        {activity.notes && (
          <p className="text-slate-700 dark:text-stone-300 italic pt-2 border-t border-stone-200 dark:border-neutral-700">{activity.notes}</p>
        )}
      </div>
    </motion.div>
  );
}