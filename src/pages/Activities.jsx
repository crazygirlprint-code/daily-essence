import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityLogger from '@/components/activity/ActivityLogger';
import ActivityCard from '@/components/activity/ActivityCard';
import { format, parseISO } from 'date-fns';

export default function Activities() {
  const [showLogger, setShowLogger] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-logged_at'),
  });

  // Create activity mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowLogger(false);
    },
  });

  // Delete activity mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Activity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });

  const filteredActivities = selectedDate
    ? activities.filter(a => a.activity_date === selectedDate)
    : activities;

  // Calculate stats for selected date
  const stats = filteredActivities.reduce(
    (acc, activity) => ({
      count: acc.count + 1,
      totalMinutes: acc.totalMinutes + (activity.duration_minutes || 0),
      avgEnergy: acc.avgEnergy + (activity.energy_level || 0),
    }),
    { count: 0, totalMinutes: 0, avgEnergy: 0 }
  );

  if (stats.count > 0) {
    stats.avgEnergy = Math.round(stats.avgEnergy / stats.count);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400">Activity Log</h1>
              <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">Track daily activities and their impact on your mood</p>
            </div>
            <Button onClick={() => setShowLogger(true)} className="bg-amber-600 dark:bg-rose-600 hover:bg-amber-700 dark:hover:bg-rose-700 gap-2">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-stone-100"
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-neutral-800 dark-luxury:bg-slate-800/50 rounded-xl p-4 border border-amber-200/50 dark:border-rose-500/30">
              <p className="text-xs text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2">Activities</p>
              <p className="text-2xl font-serif text-amber-600 dark:text-rose-400">{stats.count}</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 dark-luxury:bg-slate-800/50 rounded-xl p-4 border border-amber-200/50 dark:border-rose-500/30">
              <p className="text-xs text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2">Total Time</p>
              <p className="text-2xl font-serif text-amber-600 dark:text-rose-400">{stats.totalMinutes}m</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 dark-luxury:bg-slate-800/50 rounded-xl p-4 border border-amber-200/50 dark:border-rose-500/30">
              <p className="text-xs text-stone-600 dark:text-stone-400 uppercase tracking-widest mb-2">Avg Energy</p>
              <p className="text-2xl font-serif text-amber-600 dark:text-rose-400">{stats.avgEnergy}/10</p>
            </div>
          </motion.div>
        )}

        {/* Activities List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-stone-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white/50 dark:bg-neutral-800/50 dark-luxury:bg-blue-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-neutral-700"
          >
            <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-stone-100 mb-2">No Activities Yet</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6">Log your first activity to track mood and energy changes.</p>
            <Button onClick={() => setShowLogger(true)} className="bg-amber-600 dark:bg-rose-600 hover:bg-amber-700 dark:hover:bg-rose-700">
              Log Your First Activity
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onDelete={(id) => {
                    if (confirm('Delete this activity?')) {
                      deleteMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Activity Logger Modal */}
      <AnimatePresence>
        {showLogger && (
          <ActivityLogger
            onSubmit={(data) => createMutation.mutate(data)}
            onClose={() => setShowLogger(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}