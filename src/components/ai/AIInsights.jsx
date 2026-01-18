import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, UtensilsCrossed, RefreshCw, ChevronRight, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePremiumCheck } from '@/components/premium/usePremiumCheck';
import PremiumGate from '@/components/premium/PremiumGate';

export default function AIInsights() {
   const [insights, setInsights] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);
   const { hasAccess, isLoading: checkingAccess } = usePremiumCheck('Flourish');
   const [trialInfo, setTrialInfo] = useState({ inTrial: false, daysLeft: 0 });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 50),
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 20),
  });

  const { data: selfCareActivities = [] } = useQuery({
    queryKey: ['selfCareActivities'],
    queryFn: () => base44.entities.SelfCareActivity.list('-created_date', 10),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['specialEvents'],
    queryFn: () => base44.entities.SpecialEvent.list('-date', 10),
  });

  const { data: affirmations = [] } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => base44.entities.Affirmation.list(),
  });

  const { data: meditationSessions = [] } = useQuery({
    queryKey: ['meditationSessions'],
    queryFn: () => base44.entities.MeditationSession.list('-completed_at', 10),
  });

  const { data: beautyRoutines = [] } = useQuery({
    queryKey: ['beautyRoutines'],
    queryFn: () => base44.entities.BeautyRoutine.list(),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Analyze user data comprehensively
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      const lastWeek = format(addDays(new Date(), -7), 'yyyy-MM-dd');
      
      const recentTasks = tasks.slice(0, 30);
      const todayTasks = recentTasks.filter(t => t.due_date === today);
      const completedToday = todayTasks.filter(t => t.completed);
      const completedTasks = recentTasks.filter(t => t.completed);
      const incompleteTasks = recentTasks.filter(t => !t.completed);
      const overdueTasks = recentTasks.filter(t => t.due_date && t.due_date < today && !t.completed);
      
      // Analyze task patterns
      const tasksByCategory = recentTasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});
      
      const completionRate = recentTasks.length > 0 
        ? Math.round((completedTasks.length / recentTasks.length) * 100) 
        : 0;
      
      // Analyze time patterns
      const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
      const familyTasks = recentTasks.filter(t => t.category === 'kids' || t.family_member);
      
      // Wellness tracking
      const recentMeditations = meditationSessions.filter(m => m.completed_at >= lastWeek);
      const totalMeditationTime = recentMeditations.reduce((sum, m) => sum + m.duration_minutes, 0);
      const beautyCompletedToday = beautyRoutines.filter(r => r.last_completed === today);
      const pastSelfCare = selfCareActivities.filter(a => a.completed);
      const upcomingSelfCare = selfCareActivities.filter(a => !a.completed && a.scheduled_date >= today);
      
      // Events and schedule
      const upcomingEvents = events.filter(e => e.date >= today && e.date <= nextWeek);
      const todayEvents = events.filter(e => e.date === today);
      
      // Meals and nutrition
      const recentMeals = mealPlans.slice(0, 15);
      const todayMeals = mealPlans.filter(m => m.date === today);
      const mealTypes = recentMeals.reduce((acc, m) => {
        acc[m.meal_type] = (acc[m.meal_type] || 0) + 1;
        return acc;
      }, {});
      
      // Affirmations
      const favAffirmations = affirmations.filter(a => a.is_favorite);
      const affirmationCategories = favAffirmations.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      }, {});
      
      // User progress
      const progress = userProgress[0];
      const streakDays = progress?.streak_days || 0;
      const currentLevel = progress?.level || 1;

      const prompt = `You are an empathetic AI life coach for a busy mom. Analyze her daily patterns, habits, and current situation to provide deeply personalized, actionable insights.

TODAY'S ACTIVITY:
- Tasks completed today: ${completedToday.length}/${todayTasks.length}
- Today's events: ${todayEvents.map(e => e.title).join(', ') || 'None'}
- Beauty routine completed: ${beautyCompletedToday.length > 0 ? 'Yes' : 'Not yet'}
- Planned meals: ${todayMeals.map(m => `${m.meal_type}: ${m.meal_name}`).join(', ') || 'None planned'}

RECENT PATTERNS (Last 7 days):
- Overall completion rate: ${completionRate}%
- Task focus areas: ${Object.entries(tasksByCategory).sort((a,b) => b[1] - a[1]).slice(0,3).map(([k,v]) => `${k} (${v})`).join(', ')}
- High priority pending: ${highPriorityTasks.length} tasks
- Overdue tasks: ${overdueTasks.length}
- Family-related tasks: ${familyTasks.length}
- Meditation: ${recentMeditations.length} sessions, ${totalMeditationTime} total minutes
- Self-care completed: ${pastSelfCare.map(a => a.name).join(', ') || 'None recently'}

UPCOMING WEEK:
- Scheduled events: ${upcomingEvents.map(e => `${e.title} (${e.date}, ${e.type})`).join(', ') || 'None'}
- Self-care planned: ${upcomingSelfCare.map(a => `${a.name} on ${a.scheduled_date}`).join(', ') || 'None scheduled'}

PREFERENCES & HABITS:
- Favorite affirmations: ${Object.entries(affirmationCategories).sort((a,b) => b[1] - a[1]).map(([k,v]) => k).join(', ') || 'None favorited yet'}
- Recent meal patterns: ${Object.entries(mealTypes).map(([k,v]) => `${k}: ${v}`).join(', ')}
- Current streak: ${streakDays} days
- Level: ${currentLevel}

PROVIDE A PERSONALIZED DAILY SUMMARY AND 4 SPECIFIC, ACTIONABLE RECOMMENDATIONS:

1. Daily Summary: Write a warm 2-3 sentence summary of her day so far and patterns you notice - celebrate wins, acknowledge challenges, show you understand her life.

2. Priority Action: Based on her overdue/high-priority tasks and today's schedule, what's ONE specific thing she should focus on completing today? Be concrete.

3. Wellness Suggestion: Given her stress level (inferred from task load, upcoming events), meditation history, and self-care patterns, what specific wellness activity would help her most right now?

4. Meal Recommendation: Based on meal patterns, time of day, and energy needs, suggest ONE specific meal for today (breakfast/lunch/dinner/snack). Make it realistic for a busy mom.

5. Affirmation Focus: Based on her current challenges, incomplete tasks, and favorite themes, what affirmation theme would resonate most today?

Be warm, specific, and actionable. Reference her actual data. Speak like a supportive friend who truly knows her routine.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            daily_summary: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                tone: { type: 'string', enum: ['encouraging', 'supportive', 'energizing', 'calming'] }
              }
            },
            priority_action: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                why_now: { type: 'string' }
              }
            },
            wellness: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                benefit: { type: 'string' }
              }
            },
            meal: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                timing: { type: 'string' }
              }
            },
            affirmation: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                suggestion: { type: 'string' },
                relevance: { type: 'string' }
              }
            }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const checkTrialStatus = async () => {
      if (!hasAccess) {
        try {
          const user = await base44.auth.me();
          const accountAge = differenceInDays(new Date(), parseISO(user.created_date));
          const daysLeft = Math.max(0, 9 - accountAge);
          const inTrial = accountAge < 9;
          setTrialInfo({ inTrial, daysLeft });
        } catch (error) {
          setTrialInfo({ inTrial: false, daysLeft: 0 });
        }
      }
    };
    checkTrialStatus();
  }, [hasAccess]);

  React.useEffect(() => {
    // Auto-generate insights on mount if we have data
    if (tasks.length > 0 && !insights && (hasAccess || trialInfo.inTrial)) {
      generateInsights();
    }
  }, [tasks.length, hasAccess, trialInfo.inTrial]);

  // Premium gate
  if (checkingAccess) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-stone-100 rounded w-full" />
      </div>
    );
  }

  if (!hasAccess && !trialInfo.inTrial) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-stone-50 dark:to-stone-50 rounded-xl p-6 border border-slate-200 dark:border-stone-200 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => window.location.href = '/Pricing'}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-slate-600 dark:text-rose-400" />
              <h3 className="font-serif text-lg text-slate-800 dark:text-stone-100">AI Daily Insights</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-stone-300 mb-1">
              Get personalized recommendations based on your habits
            </p>
            <p className="text-xs text-slate-600 dark:text-rose-400 font-medium">Trial ended - Upgrade to Flourish</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-rose-400" />
        </div>
      </motion.div>
    );
  }

  if (!insights && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-50 dark:bg-stone-50 rounded-xl p-6 text-slate-900 dark:text-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-stone-200/30 border border-slate-200 dark:border-stone-200"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 dark:bg-rose-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50/50 dark:bg-rose-900/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-white dark:bg-rose-900/30 flex items-center justify-center border border-slate-300 dark:border-rose-500/40 shadow-lg shadow-slate-400/30 dark:shadow-rose-500/30 animate-shimmer bg-gradient-to-r from-white via-slate-50 to-white dark:from-rose-900/30 dark:via-rose-800/40 dark:to-rose-900/30 bg-[length:200%_100%]"
            >
              <Sparkles className="w-5 h-5 text-slate-700 dark:text-rose-300 drop-shadow-md" strokeWidth={1.5} />
            </motion.div>
            <div>
                <h3 className="font-serif text-lg text-slate-950 dark:text-stone-100 font-bold">Daily Insights</h3>
                <p className="text-[10px] text-slate-800 dark:text-stone-300 uppercase tracking-widest font-bold">AI-Powered</p>
              </div>
          </div>
          <p className="text-slate-700 dark:text-stone-300 text-xs mb-4 leading-relaxed">
            Get personalized daily summary and actionable recommendations based on your habits and goals
          </p>
          {!hasAccess && trialInfo.inTrial && (
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-700 dark:text-stone-300 bg-white dark:bg-rose-900/20 rounded-lg px-3 py-2 border border-slate-300 dark:border-rose-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Free trial: {trialInfo.daysLeft} {trialInfo.daysLeft === 1 ? 'day' : 'days'} left</span>
            </div>
          )}
          <Button
           onClick={generateInsights}
           disabled={isLoading}
           className="bg-gradient-to-r from-red-500 via-pink-400 to-rose-400 dark:from-rose-500 dark:via-pink-400 dark:to-rose-300 text-white hover:from-red-600 hover:via-pink-500 hover:to-rose-500 dark:hover:from-rose-600 dark:hover:via-pink-500 dark:hover:to-rose-400 border-0 shadow-lg shadow-rose-500/40 dark:shadow-rose-400/40"
          >
           <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
           Generate Insights
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-slate-50 dark:bg-stone-50 rounded-xl p-6 border border-slate-200 dark:border-stone-200 shadow-lg shadow-slate-200/50 dark:shadow-stone-200/30"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 dark:bg-rose-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50/50 dark:bg-rose-900/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-10 h-10 rounded-xl bg-white dark:bg-rose-900/30 flex items-center justify-center border border-slate-300 dark:border-rose-500/40 shadow-lg shadow-slate-400/30 dark:shadow-rose-500/30 animate-shimmer bg-gradient-to-r from-white via-slate-50 to-white dark:from-rose-900/30 dark:via-rose-800/40 dark:to-rose-900/30 bg-[length:200%_100%]"
              >
                <Sparkles className="w-5 h-5 text-slate-600 dark:text-rose-300 drop-shadow-md" strokeWidth={1.5} />
              </motion.div>
              <div>
                  <h3 className="font-serif text-lg text-slate-950 dark:text-stone-100 font-bold">Daily Insights</h3>
                  <p className="text-[10px] text-slate-800 dark:text-stone-300 uppercase tracking-widest font-bold">AI-Powered</p>
                </div>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                generateInsights();
              }}
              disabled={isLoading}
              className="bg-slate-700 dark:bg-rose-500 hover:bg-slate-600 dark:hover:bg-rose-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Generate Insights
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50 dark:bg-stone-50 rounded-xl p-6 text-slate-900 dark:text-slate-800 shadow-lg shadow-slate-300/40 dark:shadow-stone-200/30 relative overflow-hidden border border-slate-200 dark:border-stone-200"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 dark:bg-rose-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50/50 dark:bg-rose-900/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-white dark:bg-rose-900/30 flex items-center justify-center border border-slate-300 dark:border-rose-500/40 shadow-lg shadow-slate-400/30 dark:shadow-rose-500/30 animate-shimmer bg-gradient-to-r from-white via-slate-50 to-white dark:from-rose-900/30 dark:via-rose-800/40 dark:to-rose-900/30 bg-[length:200%_100%]"
            >
              <Sparkles className="w-5 h-5 text-slate-700 dark:text-rose-300 drop-shadow-md" strokeWidth={1.5} />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-slate-950 dark:text-stone-100 font-bold">Daily Insights</h3>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-800 dark:text-stone-300 uppercase tracking-widest font-bold">AI-Powered</p>
                {!hasAccess && trialInfo.inTrial && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-700 dark:text-stone-300 bg-white dark:bg-rose-900/20 rounded px-2 py-0.5 border border-slate-200 dark:border-rose-500/30">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{trialInfo.daysLeft}d trial left</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
            onClick={generateInsights}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className="text-slate-700 dark:text-stone-300 hover:bg-slate-200 dark:hover:bg-rose-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </Button>
            {insights && (
              <Button
              onClick={() => setIsExpanded(false)}
              size="sm"
              variant="ghost"
              className="text-slate-700 dark:text-stone-300 hover:bg-slate-200 dark:hover:bg-rose-900/30"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-slate-100 dark:bg-rose-900/20 rounded-lg p-4 animate-pulse border border-slate-200 dark:border-rose-500/30">
                  <div className="h-3 bg-slate-300 dark:bg-rose-700/30 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-slate-200 dark:bg-rose-800/20 rounded w-full" />
                </div>
              ))}
            </motion.div>
          ) : insights && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Daily Summary */}
              {insights.daily_summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/40 dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 border border-slate-300 dark:border-rose-500/30 shadow-md shadow-slate-200/30 dark:shadow-rose-500/20"
                >
                  <p className="text-sm text-slate-900 dark:text-stone-100 leading-relaxed italic">
                    "{insights.daily_summary.message}"
                  </p>
                </motion.div>
              )}

              {/* Priority Action */}
              {insights.priority_action && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-rose-500/30 hover:border-slate-300 dark:hover:border-rose-500/40 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-slate-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 border border-slate-300 dark:border-rose-500/40">
                       <span className="text-slate-700 dark:text-rose-200 text-sm font-serif">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-stone-100 mb-1">{insights.priority_action.title}</h4>
                       <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{insights.priority_action.description}</p>
                       <p className="text-[10px] text-slate-600 dark:text-stone-400 mt-1.5 uppercase tracking-widest">{insights.priority_action.why_now}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Wellness Suggestion */}
              {insights.wellness && (
                <Link to={createPageUrl('SelfCare')}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-rose-500/30 hover:border-slate-300 dark:hover:border-rose-500/40 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 border border-slate-300 dark:border-rose-500/40">
                         <Heart className="w-3.5 h-3.5 text-slate-700 dark:text-rose-300" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-stone-100">{insights.wellness.title}</h4>
                             <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-stone-400" strokeWidth={1.5} />
                           </div>
                           <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{insights.wellness.description}</p>
                           <p className="text-[10px] text-slate-600 dark:text-stone-400 mt-1.5 uppercase tracking-widest">{insights.wellness.benefit}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Meal Suggestion */}
              {insights.meal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-rose-500/30 hover:border-slate-300 dark:hover:border-rose-500/40 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded bg-slate-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 border border-slate-300 dark:border-rose-500/40">
                       <UtensilsCrossed className="w-3.5 h-3.5 text-slate-700 dark:text-rose-300" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 dark:text-stone-100 mb-1">{insights.meal.title}</h4>
                       <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{insights.meal.description}</p>
                       <p className="text-[10px] text-slate-600 dark:text-stone-400 mt-1.5 uppercase tracking-widest">{insights.meal.timing}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Affirmation Theme */}
              {insights.affirmation && (
                <Link to={createPageUrl('Affirmations')}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-rose-900/20 backdrop-blur-sm rounded-lg p-4 border border-slate-200 dark:border-rose-500/30 hover:border-slate-300 dark:hover:border-rose-500/40 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0 border border-slate-300 dark:border-rose-500/40">
                         <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-rose-300" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-stone-100">{insights.affirmation.theme}</h4>
                             <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-stone-400" strokeWidth={1.5} />
                           </div>
                           <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{insights.affirmation.suggestion}</p>
                           <p className="text-[10px] text-slate-600 dark:text-stone-400 mt-1.5 uppercase tracking-widest">{insights.affirmation.relevance}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}