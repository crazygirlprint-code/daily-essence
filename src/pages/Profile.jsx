import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Loader2, User, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GoalForm from '@/components/profile/GoalForm';
import GoalCard from '@/components/profile/GoalCard';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileEditor from '@/components/profile/ProfileEditor';
import YourWhy from '@/components/profile/YourWhy';
import PhotoGallery from '@/components/profile/PhotoGallery';

export default function Profile() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);
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
      if (response.data?.insights && response.data.insights.length > 0) {
        // Update each goal with its insight
        for (const insight of response.data.insights) {
          await base44.entities.WellnessGoal.update(insight.goal_id, {
            last_ai_insight: insight.insight,
          });
        }
        queryClient.invalidateQueries({ queryKey: ['wellnessGoals'] });
        alert('AI insights generated successfully!');
      } else {
        alert('No active goals found to generate insights for.');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
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

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPicture(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture: file_url });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setUploadingPicture(false);
    }
  };

  const activeGoals = goals.filter(g => g.active);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative group">
              <button
                onClick={() => user?.profile_picture && setExpandedImage(true)}
                disabled={uploadingPicture || !user?.profile_picture}
                className="relative cursor-pointer"
              >
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 dark:border-rose-500/30 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-rose-900/40 dark:to-pink-900/40 flex items-center justify-center border-2 border-slate-700 dark:border-rose-500/30">
                    <User className="w-8 h-8 text-slate-600 dark:text-rose-400" />
                  </div>
                )}
                {uploadingPicture && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </button>
              <button
                onClick={() => document.getElementById('profile-pic-input').click()}
                disabled={uploadingPicture}
                className="absolute bottom-0 right-0 p-1.5 bg-slate-600 dark:bg-rose-600 hover:bg-slate-700 dark:hover:bg-rose-700 rounded-full text-white shadow-lg transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              id="profile-pic-input"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
            <div>
              <h1 className="text-3xl font-serif text-slate-900 dark:text-stone-100">My Profile</h1>
              <p className="text-slate-900 dark:text-stone-100 font-medium">{user?.display_name || user?.full_name}</p>
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

        {/* Your Why Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <YourWhy 
            user={user} 
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['currentUser'] })}
          />
        </motion.div>

        {/* Photo Gallery Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <PhotoGallery 
            photos={user?.photo_gallery || []}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['currentUser'] })}
          />
        </motion.div>

        {/* Wellness Goals Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-slate-900 dark:text-stone-100">Wellness Goals</h2>
            <div className="flex gap-2">
              <Button
                onClick={generateInsights}
                disabled={loadingInsights || activeGoals.length === 0}
                className="gap-2 bg-slate-700 hover:bg-slate-800 text-white border-2 border-slate-700 dark:border-none dark:bg-gradient-to-r dark:from-rose-500 dark:via-rose-400 dark:to-pink-500 dark:hover:from-rose-600 dark:hover:via-rose-500 dark:hover:to-pink-600 shadow-lg"
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
              <Button onClick={() => setShowAddGoal(true)} className="bg-slate-700 hover:bg-slate-800 text-white border-2 border-slate-700 dark:border-none dark:bg-gradient-to-r dark:from-rose-500 dark:via-rose-400 dark:to-pink-500 dark:hover:from-rose-600 dark:hover:via-rose-500 dark:hover:to-pink-600 shadow-lg gap-2">
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
              className="text-center py-16 bg-white/50 dark:bg-rose-950/20 rounded-2xl border border-dashed border-slate-700 dark:border-rose-500/30"
            >
              <Sparkles className="w-12 h-12 text-slate-400 dark:text-rose-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-stone-100 mb-2">No Wellness Goals Yet</h3>
              <p className="text-stone-600 dark:text-stone-100 mb-6">Set your first wellness goal to get personalized AI insights.</p>
              <Button onClick={() => setShowAddGoal(true)} className="bg-slate-700 hover:bg-slate-800 text-white border-2 border-slate-700 dark:border-none dark:bg-gradient-to-r dark:from-rose-500 dark:via-rose-400 dark:to-pink-500 dark:hover:from-rose-600 dark:hover:via-rose-500 dark:hover:to-pink-600 shadow-lg">
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

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && user?.profile_picture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={() => setExpandedImage(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={user.profile_picture}
              alt="Profile"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}