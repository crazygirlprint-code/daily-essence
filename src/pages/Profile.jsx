import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GoalForm from '@/components/profile/GoalForm';
import GoalCard from '@/components/profile/GoalCard';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileEditor from '@/components/profile/ProfileEditor';

export default function Profile() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch wellness goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['wellnessGoals'],
    queryFn: () => base44.entities.WellnessGoal.list('-created_date'),
  });

  // Create goal mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WellnessGoal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessGoals'] });
      setShowAddGoal(false);
    },
  });

  // Update goal mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WellnessGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessGoals'] });
      setEditingGoal(null);
    },
  });

  // Delete goal mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WellnessGoal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wellnessGoals'] }),
  });

  // Generate insights
  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await base44.functions.invoke('generateGoalInsights', {});
      if (response.data?.insights) {
        // Update each goal with its insight
        for (const insight of response.data.insights) {
          await base44.entities.WellnessGoal.update(insight.goal_id, {
            last_ai_insight: insight.insight,
          });
        }
        queryClient.invalidateQueries({ queryKey: ['wellnessGoals'] });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleAddGoal = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleUpdateGoal = (formData) => {
    updateMutation.mutate({ id: editingGoal.id, data: formData });
  };

  const handleDeleteGoal = (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await base44.auth.updateMe(profileData);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const activeGoals = goals.filter(g => g.active);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-stone-100 dark:from-rose-900/40 dark:to-pink-900/40 dark-luxury:from-amber-950 dark-luxury:to-blue-900 flex items-center justify-center">
              <User className="w-6 h-6 text-amber-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400">My Profile</h1>
              <p className="text-slate-900 dark:text-stone-100 font-medium">{user?.full_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Info Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          {isEditingProfile ? (
            <ProfileEditor 
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditingProfile(false)}
            />
          ) : (
            <ProfileInfo 
              user={user}
              onEdit={() => setIsEditingProfile(true)}
            />
          )}
        </motion.div>

        {/* Wellness Goals Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-400">Wellness Goals</h2>
            <div className="flex gap-2">
              <Button
                onClick={generateInsights}
                disabled={loadingInsights || activeGoals.length === 0}
                className="gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700 text-white"
              >
                {loadingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Insights
                  </>
                )}
              </Button>
              <Button onClick={() => setShowAddGoal(true)} className="bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700 gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
          </div>

          {/* Add/Edit Goal Form */}
          <AnimatePresence>
            {(showAddGoal || editingGoal) && (
              <GoalForm
                goal={editingGoal}
                onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}
                onCancel={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Goals Grid */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-stone-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-stone-300"
            >
              <Sparkles className="w-12 h-12 text-amber-400 dark:text-rose-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Wellness Goals Yet</h3>
              <p className="text-stone-600 mb-6">Set your first wellness goal to get personalized AI insights.</p>
              <Button onClick={() => setShowAddGoal(true)} className="bg-amber-600 hover:bg-amber-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700">
                Create Your First Goal
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEditGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}