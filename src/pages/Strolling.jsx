import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityLogger from '@/components/activity/ActivityLogger';
import ActivityCard from '@/components/activity/ActivityCard';

export default function Strolling() {
  const [showLogger, setShowLogger] = useState(false);
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['strollingActivities'],
    queryFn: async () => {
      const all = await base44.entities.Activity.list('-logged_at');
      return all.filter(a => a.type === 'mindful_walking');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strollingActivities'] });
      setShowLogger(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Activity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strollingActivities'] }),
  });

  const totalMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  const totalStrolls = activities.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-neutral-900 dark:text-stone-100">Strolling</h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">Track your walks and strolls</p>
          </div>
          <Button
            onClick={() => setShowLogger(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Stroll
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-stone-200/50 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-700 dark:text-stone-300">Total Strolls</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-stone-100">{totalStrolls}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-stone-200/50 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-stone-700 dark:text-stone-300">Total Time</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-stone-100">{totalMinutes} min</p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        ) : activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-stone-100 mb-2">
              No strolls yet
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Start logging your walks and strolls to track your wellness journey
            </p>
            <Button
              onClick={() => setShowLogger(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              Log Your First Stroll
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onDelete={() => deleteMutation.mutate(activity.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLogger && (
          <ActivityLogger
            onSubmit={(data) => createMutation.mutate({ ...data, type: 'mindful_walking' })}
            onClose={() => setShowLogger(false)}
            preselectedType="mindful_walking"
            prefilledTitle="Afternoon stroll"
          />
        )}
      </AnimatePresence>
    </div>
  );
}