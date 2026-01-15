import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, UtensilsCrossed, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      // Analyze user data
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      
      const recentTasks = tasks.slice(0, 20);
      const completedTasks = recentTasks.filter(t => t.completed);
      const incompleteTasks = recentTasks.filter(t => !t.completed);
      const tasksByCategory = recentTasks.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});

      const recentMeals = mealPlans.slice(0, 10);
      const upcomingEvents = events.filter(e => e.date >= today && e.date <= nextWeek);
      const pastSelfCare = selfCareActivities.filter(a => a.completed);
      const favAffirmations = affirmations.filter(a => a.is_favorite);

      const prompt = `You are a supportive AI assistant for a busy mom's planner app. Analyze the user's activity and provide personalized recommendations.

USER DATA:
- Recent tasks: ${recentTasks.length} total (${completedTasks.length} completed, ${incompleteTasks.length} pending)
- Task categories: ${JSON.stringify(tasksByCategory)}
- Recent incomplete tasks: ${incompleteTasks.slice(0, 5).map(t => t.title).join(', ')}
- Recent meals: ${recentMeals.map(m => `${m.meal_type}: ${m.meal_name}`).join(', ')}
- Past self-care activities: ${pastSelfCare.map(a => a.name).join(', ')}
- Upcoming events: ${upcomingEvents.map(e => `${e.title} on ${e.date}`).join(', ')}
- Favorite affirmation categories: ${favAffirmations.map(a => a.category).join(', ')}

Provide exactly 3 personalized recommendations:
1. A self-care activity suggestion (consider upcoming events and their stress levels, past preferences)
2. A meal idea that complements their recent meal patterns (be specific and practical)
3. An affirmation theme that matches their current challenges (based on incomplete tasks and categories)

Be warm, supportive, and specific to their data. Keep each recommendation to 1-2 sentences.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            self_care: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                reason: { type: 'string' }
              }
            },
            meal: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                reason: { type: 'string' }
              }
            },
            affirmation: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                description: { type: 'string' },
                reason: { type: 'string' }
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
    // Auto-generate insights on mount if we have data
    if (tasks.length > 0 && !insights) {
      generateInsights();
    }
  }, [tasks.length]);

  if (!insights && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">AI Insights</h3>
        </div>
        <p className="text-white/80 text-sm mb-4">
          Get personalized recommendations based on your activity
        </p>
        <Button
          onClick={generateInsights}
          disabled={isLoading}
          className="bg-white text-purple-600 hover:bg-white/90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Insights
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">AI Insights</h3>
              <p className="text-xs text-white/70">Personalized for you</p>
            </div>
          </div>
          <Button
            onClick={generateInsights}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/20 rounded w-full" />
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
              {/* Self-Care Suggestion */}
              <Link to={createPageUrl('SelfCare')}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-400/30 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insights.self_care.title}</h4>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{insights.self_care.description}</p>
                      <p className="text-[10px] text-white/50 mt-1 italic">{insights.self_care.reason}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Meal Suggestion */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/30 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-4 h-4 text-amber-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{insights.meal.title}</h4>
                    <p className="text-xs text-white/80 leading-relaxed">{insights.meal.description}</p>
                    <p className="text-[10px] text-white/50 mt-1 italic">{insights.meal.reason}</p>
                  </div>
                </div>
              </motion.div>

              {/* Affirmation Theme */}
              <Link to={createPageUrl('Affirmations')}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-400/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insights.affirmation.theme}</h4>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{insights.affirmation.description}</p>
                      <p className="text-[10px] text-white/50 mt-1 italic">{insights.affirmation.reason}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}