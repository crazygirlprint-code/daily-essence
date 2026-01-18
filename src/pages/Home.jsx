import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isToday } from 'date-fns';
import { useTimezone } from '@/components/hooks/useTimezone';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, Sparkles, Heart, Leaf, UtensilsCrossed, StickyNote, Pencil, Trophy, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import DayHeader from '@/components/planner/DayHeader';
import WeekStrip from '@/components/planner/WeekStrip';
import StatsCard from '@/components/planner/StatsCard';
import CategoryFilter from '@/components/planner/CategoryFilter';
import TaskCard from '@/components/planner/TaskCard';
import QuickAddTask from '@/components/planner/QuickAddTask';
import EmptyState from '@/components/planner/EmptyState';
import MealPlanner from '@/components/planner/MealPlanner';
import QuickNotes from '@/components/planner/QuickNotes';
import StatsHeader from '@/components/gamification/StatsHeader';
import { useGamification } from '@/components/gamification/useGamification';
import PointsPopup from '@/components/gamification/PointsPopup';
import AchievementUnlock from '@/components/gamification/AchievementUnlock';
import AIInsights from '@/components/ai/AIInsights';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [activeSection, setActiveSection] = useState('tasks');
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState('fahrenheit');

  useTimezone();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { progress, addPoints, getProgressToNextLevel } = useGamification();
  
  // Fetch current user
  React.useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setTemperatureUnit(userData?.temperature_unit || 'fahrenheit');
    }).catch(() => {});
  }, []);
  
  // Fetch weather forecast
  useEffect(() => {
    const getWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await base44.functions.invoke('getWeather', {
                lat: latitude,
                lon: longitude,
              });
              if (response.data?.forecast) {
                setWeatherForecast(response.data.forecast);
              }
            },
            (error) => {
              console.log('Geolocation error, using default:', error);
            }
          );
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };
    
    getWeather();
  }, []);
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });
  
  // Fetch family members
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Filter tasks by selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const tasksForDate = useMemo(() => {
    return tasks.filter(t => t.due_date === selectedDateStr);
  }, [tasks, selectedDateStr]);
  
  // Filter by category
  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return tasksForDate;
    return tasksForDate.filter(t => t.category === selectedCategory);
  }, [tasksForDate, selectedCategory]);
  
  // Sort tasks: incomplete first, then by priority
  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTasks]);
  
  // Calculate task counts per category
  const taskCounts = useMemo(() => {
    return tasksForDate.reduce((acc, task) => {
      if (!task.completed) {
        acc[task.category] = (acc[task.category] || 0) + 1;
      }
      return acc;
    }, {});
  }, [tasksForDate]);
  
  // Calculate tasks per date for the week strip
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (task.due_date && !task.completed) {
        acc[task.due_date] = (acc[task.due_date] || 0) + 1;
      }
      return acc;
    }, {});
  }, [tasks]);
  
  const handleToggleTask = async (task) => {
    const isCompleting = !task.completed;
    updateMutation.mutate({ id: task.id, data: { completed: isCompleting } });
    
    if (isCompleting) {
      const result = await addPoints('task_complete');
      setPointsEarned(result.pointsEarned);
      setShowPoints(true);
      
      if (result.newBadge) {
        setUnlockedBadge(result.newBadge);
      }
    }
  };
  
  const handleDeleteTask = (task) => {
    deleteMutation.mutate(task.id);
  };
  
  const handleAddTask = (taskData) => {
    createMutation.mutate({ ...taskData, completed: false });
  };
  
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const allTasksDone = tasksForDate.length > 0 && pendingTasks.length === 0 && selectedCategory === 'all';

  const quickLinks = [
    { name: 'Affirmations', icon: Sparkles, color: 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-purple-400 dark:to-purple-500', textColor: 'text-white', page: 'Affirmations' },
    { name: 'Beauty', icon: Smile, color: 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-pink-400 dark:to-pink-500', textColor: 'text-white', page: 'Beauty' },
    { name: 'Meditation', icon: Leaf, color: 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-rose-400 dark:to-rose-500', textColor: 'text-white', page: 'Meditation' },
    { name: 'Self-Care', icon: Heart, color: 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-fuchsia-400 dark:to-fuchsia-500', textColor: 'text-white', page: 'SelfCare' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <DayHeader date={selectedDate} userName={user?.display_name || user?.full_name} />
        
        {/* AI Insights */}
        <div className="mb-8">
          <AIInsights />
        </div>

        {/* Progress Report */}
         <motion.div 
           whileTap={{ scale: 0.98 }}
           className="relative overflow-hidden flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-rose-900/20 text-slate-900 dark:text-stone-100 border-0 shadow-lg shadow-slate-200/50 dark:border-rose-500/30 mb-8 cursor-pointer"
           onClick={() => navigate(createPageUrl('Progress'))}
         >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/20 rounded-full blur-2xl" />
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border border-purple-200">
            <Trophy className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Your Progress</p>
            <div className="flex items-center gap-3 mb-2">
              <div>
                <span className="font-serif text-lg font-semibold text-slate-900">{progress.points || 0}</span>
                <span className="text-xs text-slate-500 ml-1">pts</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div>
                <span className="font-serif text-lg font-semibold text-slate-900">L{progress.level || 1}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div>
                <span className="font-serif text-lg font-semibold text-slate-900">{progress.streak_days || 0}</span>
                <span className="text-xs text-slate-500 ml-1">🔥</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-600 to-slate-700 dark:from-purple-500 dark:to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${getProgressToNextLevel()}%` }}
              />
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
        </motion.div>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.name} to={createPageUrl(link.page)}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg ${link.color} ${link.textColor} border-0 shadow-lg`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[9px] font-medium uppercase tracking-widest">{link.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        <div className="mb-8">
          <WeekStrip 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasksByDate={tasksByDate}
            forecast={weatherForecast}
            temperatureUnit={temperatureUnit}
          />
        </div>
        
        {isToday(selectedDate) && tasksForDate.length > 0 && (
          <div className="mb-8">
            <StatsCard tasks={tasksForDate} />
          </div>
        )}
        
        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'tasks', label: 'Tasks', icon: Plus },
            { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
            { id: 'notes', label: 'Notes', icon: StickyNote },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all tracking-wide ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg shadow-slate-500/40 dark:bg-gradient-to-r dark:from-rose-500 dark:via-pink-500 dark:to-rose-600 dark:hover:from-rose-600 dark:hover:via-pink-600 dark:hover:to-rose-700 dark:shadow-rose-500/40'
                          : 'bg-white/50 text-stone-700 border border-stone-300 hover:bg-stone-50 dark:bg-rose-950/20 dark:border-rose-500/30 dark:text-stone-300 dark:hover:bg-rose-950/30'
                      }`}
                    >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {section.label}
              </button>
            );
          })}
        </div>
        
        {activeSection === 'tasks' && (
          <>
            <div className="mb-6">
              <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
                taskCounts={taskCounts}
              />
            </div>
            

            <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-stone-100/50 rounded-2xl p-4 border border-slate-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedTasks.length === 0 ? (
               <EmptyState type={allTasksDone ? 'all-done' : 'no-tasks'} />
            ) : (
              sortedTasks.map((task) => (
                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
                                    onDelete={handleDeleteTask}
                                    onEdit={(task) => {
                                      setEditingTask(task);
                                      // TODO: Open edit task dialog
                                    }}
                                  />
              ))
            )}
            </AnimatePresence>
            </div>
          </>
        )}
        
        {activeSection === 'meals' && (
           <div className="bg-stone-100/50 dark:bg-rose-200/20 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-rose-500/30">
             <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              Meal Plan for {format(selectedDate, 'EEEE')}
            </h3>
            <MealPlanner 
              selectedDate={selectedDate} 
              onAddPoints={async (action) => {
                const result = await addPoints(action);
                setPointsEarned(result.pointsEarned);
                setShowPoints(true);
              }}
            />
          </div>
        )}
        
        {activeSection === 'notes' && (
           <div className="bg-stone-100/50 dark:bg-rose-200/20 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-rose-500/30">
             <QuickNotes />
          </div>
        )}
      </div>
      
      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <Button
           onClick={() => setIsAddOpen(true)}
           className="h-14 w-14 rounded-full text-white shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-slate-500/30 dark:from-rose-500 dark:to-pink-600 dark:hover:from-rose-600 dark:hover:to-pink-700 dark:shadow-rose-500/40"
         >
          <Plus className="w-6 h-6" strokeWidth={1.5} />
        </Button>
      </motion.div>
      
      {/* Bottom Navigation */}
       <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-purple-900/80 dark-luxury:bg-slate-950/80 backdrop-blur-lg border-t border-stone-300 dark:border-rose-500/20 dark-luxury:border-amber-900/30 px-6 py-3 md:hidden">
         <div className="flex justify-around items-center max-w-md mx-auto">
           <button className="flex flex-col items-center gap-1 text-stone-900 dark:text-stone-100">
             <Calendar className="w-5 h-5" strokeWidth={1.5} />
             <span className="text-[10px] font-medium uppercase tracking-widest dark:text-stone-100">Today</span>
           </button>
           <Link to={createPageUrl('Calendar')} className="flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400">
             <Calendar className="w-5 h-5" strokeWidth={1.5} />
             <span className="text-[10px] font-medium uppercase tracking-widest">Calendar</span>
           </Link>
           <Link to={createPageUrl('Family')} className="flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400">
             <Users className="w-5 h-5" strokeWidth={1.5} />
             <span className="text-[10px] font-medium uppercase tracking-widest">Family</span>
           </Link>
        </div>
      </div>
      
      <QuickAddTask
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddTask}
        familyMembers={familyMembers}
      />
      
      <PointsPopup
        points={pointsEarned}
        show={showPoints}
        onComplete={() => setShowPoints(false)}
        message="Task completed!"
        streakBonus={0}
      />
      
      <AchievementUnlock
        badge={unlockedBadge}
        show={!!unlockedBadge}
        onClose={() => setUnlockedBadge(null)}
      />
      

    </div>
  );
}