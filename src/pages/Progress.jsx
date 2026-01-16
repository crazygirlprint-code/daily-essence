import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Flame, Calendar, CheckCircle2 } from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';
import StreakDisplay from '@/components/gamification/StreakDisplay';
import { useGamification } from '@/components/gamification/useGamification';
import { format, subDays, eachDayOfInterval, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePremiumCheck } from '@/components/premium/usePremiumCheck';
import PremiumGate from '@/components/premium/PremiumGate';

export default function Progress() {
  const { progress, getProgressToNextLevel, BADGES, LEVEL_THRESHOLDS } = useGamification();
  const { hasAccess, isLoading: checkingAccess } = usePremiumCheck('Flourish');
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date')
  });
  
  const { data: meditationSessions = [] } = useQuery({
    queryKey: ['meditationSessions'],
    queryFn: () => base44.entities.MeditationSession.list('-created_date')
  });
  
  const { data: selfCareActivities = [] } = useQuery({
    queryKey: ['selfCareActivities'],
    queryFn: () => base44.entities.SelfCareActivity.list('-created_date')
  });
  
  const { data: beautyRoutines = [] } = useQuery({
    queryKey: ['beautyRoutines'],
    queryFn: () => base44.entities.BeautyRoutine.list()
  });
  
  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list()
  });
  
  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalMeditationMinutes = meditationSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const completedSelfCare = selfCareActivities.filter(a => a.completed).length;
  const completedBeautySteps = beautyRoutines.filter(r => r.last_completed).length;
  
  // Activity heatmap for last 30 days
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });
  
  const activityByDate = tasks.reduce((acc, task) => {
    if (task.completed && task.updated_date) {
      const date = format(new Date(task.updated_date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  const stats = [
    { 
      label: 'Total Points', 
      value: progress.points || 0, 
      icon: Zap, 
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50'
    },
    { 
      label: 'Current Level', 
      value: progress.level || 1, 
      icon: Trophy, 
      color: 'from-rose-400 to-pink-500',
      bgColor: 'bg-rose-50'
    },
    { 
      label: 'Day Streak', 
      value: progress.streak_days || 0, 
      icon: Flame, 
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'Tasks Done', 
      value: completedTasks, 
      icon: CheckCircle2, 
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50'
    },
  ];
  
  const extraStats = [
    { label: 'Meditation Minutes', value: totalMeditationMinutes },
    { label: 'Self-Care Activities', value: completedSelfCare },
    { label: 'Beauty Steps Completed', value: completedBeautySteps },
    { label: 'Meals Planned', value: mealPlans.length },
  ];

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <PremiumGate
        requiredTier="Flourish"
        featureName="Advanced analytics dashboard"
        benefits={[
          'Activity heatmap visualization',
          'Detailed progress statistics',
          'Achievement tracking',
          'Level milestone progress'
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Your Progress</h1>
          <p className="text-slate-500 mt-1">Keep going, you're doing amazing! 🌟</p>
        </div>
        
        {/* Level and Streak */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <LevelBadge 
            level={progress.level || 1} 
            points={progress.points || 0} 
            progressPercent={getProgressToNextLevel()}
          />
          <StreakDisplay streak={progress.streak_days || 0} />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn('rounded-2xl p-4', stat.bgColor)}
              >
                <Icon className={cn('w-6 h-6 mb-2', `text-${stat.color.split('-')[1]}-500`)} />
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
        
        {/* Extra Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-slate-700 mb-4">Your Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {extraStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-center p-3 bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl"
              >
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Activity Heatmap */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            Activity (Last 30 Days)
          </h3>
          <div className="grid grid-cols-10 gap-1">
            {last30Days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = activityByDate[dateStr] || 0;
              const intensity = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3;
              
              return (
                <div
                  key={dateStr}
                  title={`${format(day, 'MMM d')}: ${count} tasks`}
                  className={cn(
                    'aspect-square rounded-sm transition-colors',
                    intensity === 0 && 'bg-slate-100',
                    intensity === 1 && 'bg-rose-200',
                    intensity === 2 && 'bg-rose-400',
                    intensity === 3 && 'bg-rose-600',
                    isToday(day) && 'ring-2 ring-rose-400 ring-offset-1'
                  )}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100" />
              <div className="w-3 h-3 rounded-sm bg-rose-200" />
              <div className="w-3 h-3 rounded-sm bg-rose-400" />
              <div className="w-3 h-3 rounded-sm bg-rose-600" />
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* Badges */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </h3>
          <BadgesDisplay 
            earnedBadges={progress.badges || []} 
            showAll={true}
            showFilter={true}
          />
        </div>
        
        {/* Level Milestones */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Level Milestones</h3>
          <div className="space-y-3">
            {LEVEL_THRESHOLDS.slice(0, 10).map((threshold, index) => {
              const level = index + 1;
              const isReached = (progress.level || 1) >= level;
              const isCurrent = (progress.level || 1) === level;
              
              return (
                <div
                  key={level}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all',
                    isReached ? 'bg-gradient-to-r from-rose-50 to-pink-50' : 'bg-slate-50',
                    isCurrent && 'ring-2 ring-rose-300'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                    isReached 
                      ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white' 
                      : 'bg-slate-200 text-slate-400'
                  )}>
                    {level}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      isReached ? 'text-slate-700' : 'text-slate-400'
                    )}>
                      Level {level}
                    </p>
                    <p className="text-xs text-slate-400">{threshold} points</p>
                  </div>
                  {isReached && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}