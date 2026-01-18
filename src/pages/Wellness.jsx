import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Plus, Check, Trash2, Sparkles, Heart, ShoppingBag, UtensilsCrossed, Film, 
  TreePine, Users, Palette, Calendar, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useGamification } from '@/components/gamification/useGamification';
import PointsPopup from '@/components/gamification/PointsPopup';

const DEFAULT_MORNING = [
  { name: 'Cleanser', type: 'morning', order: 1 },
  { name: 'Toner', type: 'morning', order: 2 },
  { name: 'Vitamin C Serum', type: 'morning', order: 3 },
  { name: 'Moisturizer', type: 'morning', order: 4 },
  { name: 'Sunscreen SPF 50+', type: 'morning', order: 5 },
];

const DEFAULT_NIGHT = [
  { name: 'Makeup Remover', type: 'night', order: 1 },
  { name: 'Double Cleanse', type: 'night', order: 2 },
  { name: 'Exfoliant (2-3x/week)', type: 'night', order: 3 },
  { name: 'Toner', type: 'night', order: 4 },
  { name: 'Retinol Serum', type: 'night', order: 5 },
  { name: 'Eye Cream', type: 'night', order: 6 },
  { name: 'Night Cream', type: 'night', order: 7 },
];

const ACTIVITY_TYPES = [
  { id: 'spa', name: 'Spa Day', icon: Sparkles, color: 'bg-pink-100 text-pink-600' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
  { id: 'dinner', name: 'Dinner Out', icon: UtensilsCrossed, color: 'bg-amber-100 text-amber-600' },
  { id: 'movie', name: 'Movie Night', icon: Film, color: 'bg-blue-100 text-blue-600' },
  { id: 'massage', name: 'Massage', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: 'nature', name: 'Nature Walk', icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'social', name: 'Friend Date', icon: Users, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'hobby', name: 'Hobby Time', icon: Palette, color: 'bg-indigo-100 text-indigo-600' },
];

const SUGGESTIONS = [
  "Book a massage at your favorite spa",
  "Plan a girls' night out",
  "Take yourself on a solo dinner date",
  "Schedule a manicure/pedicure",
  "Go to a yoga class",
  "Have a movie marathon at home",
  "Take a bubble bath with candles",
  "Go for a nature hike",
  "Visit a museum or art gallery",
  "Try a new restaurant",
  "Get your hair done",
  "Have a picnic in the park"
];

export default function Wellness() {
  const [activeTab, setActiveTab] = useState('beauty');
  const [beautyTab, setBeautyTab] = useState('morning');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [newActivity, setNewActivity] = useState({
    name: '',
    type: 'spa',
    scheduled_date: '',
    notes: ''
  });
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const queryClient = useQueryClient();
  const { addPoints } = useGamification();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Beauty Routines
  const { data: routines = [] } = useQuery({
    queryKey: ['beautyRoutines'],
    queryFn: async () => {
      const existing = await base44.entities.BeautyRoutine.list();
      if (existing.length === 0) {
        await base44.entities.BeautyRoutine.bulkCreate([...DEFAULT_MORNING, ...DEFAULT_NIGHT]);
        return await base44.entities.BeautyRoutine.list();
      }
      return existing;
    }
  });

  // Self-Care Activities
  const { data: activities = [] } = useQuery({
    queryKey: ['selfCareActivities'],
    queryFn: () => base44.entities.SelfCareActivity.list('-created_date')
  });
  
  const createRoutineMutation = useMutation({
    mutationFn: (data) => base44.entities.BeautyRoutine.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] });
      setIsAddOpen(false);
      setNewStep('');
    }
  });

  const updateRoutineMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BeautyRoutine.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] })
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (id) => base44.entities.BeautyRoutine.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] })
  });

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.SelfCareActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selfCareActivities'] });
      setIsAddOpen(false);
      setNewActivity({ name: '', type: 'spa', scheduled_date: '', notes: '' });
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SelfCareActivity.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['selfCareActivities'] })
  });

  // Beauty Routines Logic
  const morningRoutines = routines
    .filter(r => r.type === 'morning')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const nightRoutines = routines
    .filter(r => r.type === 'night')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const currentRoutines = beautyTab === 'morning' ? morningRoutines : nightRoutines;
  const completedToday = (routine) => routine.last_completed === today;
  const completedCount = currentRoutines.filter(r => completedToday(r)).length;
  const totalCount = currentRoutines.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Self-Care Logic
  const upcomingActivities = activities.filter(a => !a.completed && a.scheduled_date);
  const completedActivities = activities.filter(a => a.completed);
  const unscheduledActivities = activities.filter(a => !a.completed && !a.scheduled_date);
  const lastSelfCare = completedActivities[0];
  const daysSinceLastSelfCare = lastSelfCare 
    ? differenceInDays(new Date(), new Date(lastSelfCare.updated_date || lastSelfCare.created_date))
    : 30;
  const needsReminder = daysSinceLastSelfCare > 14;

  const handleToggleRoutine = async (routine) => {
    const isCompleting = !completedToday(routine);
    await updateRoutineMutation.mutateAsync({
      id: routine.id,
      data: {
        completed_today: isCompleting,
        last_completed: isCompleting ? today : null
      }
    });
    
    if (isCompleting) {
      const result = await addPoints('beauty_routine');
      let totalPoints = result.pointsEarned;
      
      const updatedRoutines = await base44.entities.BeautyRoutine.list();
      const currentTypeRoutines = updatedRoutines.filter(r => r.type === beautyTab);
      const allComplete = currentTypeRoutines.every(r => r.last_completed === today);
      
      if (allComplete) {
        const bonusResult = await addPoints('beauty_routine_complete');
        totalPoints += bonusResult.pointsEarned;
      }
      
      setPointsEarned(totalPoints);
      setShowPoints(true);
    }
  };

  const handleCompleteActivity = async (activity) => {
    await updateActivityMutation.mutateAsync({
      id: activity.id,
      data: { completed: true }
    });
    
    const result = await addPoints('self_care');
    setPointsEarned(result.pointsEarned);
    setShowPoints(true);
  };

  const handleAddRoutineStep = () => {
    if (!newStep.trim()) return;
    const maxOrder = Math.max(...currentRoutines.map(r => r.order || 0), 0);
    createRoutineMutation.mutate({
      name: newStep,
      type: beautyTab,
      order: maxOrder + 1,
      completed_today: false
    });
  };

  const randomSuggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4 dark:bg-rose-900/30 dark:border dark:border-rose-500/30">
             <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
             <span className="font-medium text-slate-700 dark:text-stone-100">Wellness</span>
           </div>
           <p className="text-slate-500 dark:text-stone-400">Beauty routines & self-care activities</p>
         </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white/50 rounded-2xl p-1 mb-6">
            <TabsTrigger
              value="beauty"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Beauty
            </TabsTrigger>
            <TabsTrigger
              value="selfcare"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Self-Care
            </TabsTrigger>
          </TabsList>

          {/* Beauty Content */}
          <TabsContent value="beauty" className="space-y-6">
            <Tabs value={beautyTab} onValueChange={setBeautyTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full bg-white/50 rounded-2xl p-1 mb-6">
                <TabsTrigger
                  value="morning"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Morning
                </TabsTrigger>
                <TabsTrigger
                  value="night"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Night
                </TabsTrigger>
              </TabsList>

              <div className={cn(
                'rounded-2xl p-6 mb-6 text-white',
                beautyTab === 'morning' 
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500'
              )}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Today's Progress</h3>
                  <span className="text-2xl font-bold">{completedCount}/{totalCount}</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                {progress === 100 && (
                  <p className="text-sm mt-3 text-white/90">✨ Amazing! Routine complete!</p>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <AnimatePresence>
                  {currentRoutines.map((routine, index) => (
                    <motion.div
                      key={routine.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'group flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border transition-all',
                        completedToday(routine) 
                          ? 'border-green-200 bg-green-50/50' 
                          : 'border-slate-100 hover:shadow-md'
                      )}
                    >
                      <span className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        completedToday(routine)
                          ? 'bg-green-500 text-white'
                          : beautyTab === 'morning'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-600'
                      )}>
                        {completedToday(routine) ? <Check className="w-4 h-4" /> : index + 1}
                      </span>
                      
                      <span className={cn(
                        'flex-1 font-medium',
                        completedToday(routine) ? 'text-green-700 line-through dark:text-green-400' : 'text-slate-700 dark:text-stone-100'
                      )}>
                        {routine.name}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={completedToday(routine)}
                          onCheckedChange={() => handleToggleRoutine(routine)}
                          className={cn(
                            "w-6 h-6 rounded-lg",
                            beautyTab === 'morning'
                              ? "data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                              : "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                          )}
                        />
                        <button
                          onClick={() => deleteRoutineMutation.mutate(routine.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Button
                onClick={() => setIsAddOpen(true)}
                variant="outline"
                className="w-full rounded-2xl h-14 border-dashed border-2 hover:bg-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Step
              </Button>
            </Tabs>
          </TabsContent>

          {/* Self-Care Content */}
          <TabsContent value="selfcare" className="space-y-6">
            {needsReminder && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-4 text-white"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Time for some self-love! 💖</h3>
                    <p className="text-sm text-white/90 mt-1">
                      It's been {daysSinceLastSelfCare}+ days since your last self-care activity.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-rose-900/20 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-rose-500/30"
              >
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-sm font-medium dark:text-stone-200">Suggestion for you</span>
                </div>
                <p className="text-slate-700 dark:text-stone-100 font-medium">{randomSuggestion}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewActivity({ ...newActivity, name: randomSuggestion });
                      setIsAddOpen(true);
                    }}
                    className="rounded-xl bg-slate-700 hover:bg-slate-800"
                  >
                    Schedule This
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSuggestion(false)}
                    className="rounded-xl"
                  >
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setNewActivity({ ...newActivity, type: type.id, name: type.name });
                      setIsAddOpen(true);
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={cn('p-3 rounded-xl', type.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{type.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {upcomingActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-stone-100 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  Scheduled
                </h3>
                <div className="space-y-3">
                  {upcomingActivities.map((activity) => {
                    const typeInfo = ACTIVITY_TYPES.find(t => t.id === activity.type) || ACTIVITY_TYPES[0];
                    const Icon = typeInfo.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm"
                      >
                        <div className={cn('p-3 rounded-xl', typeInfo.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 dark:text-stone-100">{activity.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-stone-400">
                            {format(new Date(activity.scheduled_date), 'EEEE, MMMM d')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteActivity(activity)}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Done
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {unscheduledActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Ideas</h3>
                <div className="space-y-2">
                  {unscheduledActivities.map((activity) => {
                    const typeInfo = ACTIVITY_TYPES.find(t => t.id === activity.type) || ACTIVITY_TYPES[0];
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
                      >
                        <span className={cn('w-3 h-3 rounded-full', typeInfo.color.split(' ')[0])} />
                        <span className="flex-1 text-slate-600">{activity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedActivities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Completed ({completedActivities.length})
                </h3>
                <div className="space-y-2">
                  {completedActivities.slice(0, 5).map((activity) => {
                    const typeInfo = ACTIVITY_TYPES.find(t => t.id === activity.type) || ACTIVITY_TYPES[0];
                    const Icon = typeInfo.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl opacity-70"
                      >
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 line-through">{activity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl bg-slate-700 hover:bg-slate-800 text-white shadow-slate-500/30"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'beauty' 
                ? `Add ${beautyTab === 'morning' ? 'Morning' : 'Night'} Step`
                : 'Plan Self-Care Activity'
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder={activeTab === 'beauty' ? "e.g., Apply face mask" : "What will you do?"}
              value={activeTab === 'beauty' ? newStep : newActivity.name}
              onChange={(e) => activeTab === 'beauty' 
                ? setNewStep(e.target.value)
                : setNewActivity({ ...newActivity, name: e.target.value })
              }
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'beauty' ? handleAddRoutineStep() : null)}
            />

            {activeTab === 'selfcare' && (
              <>
                <Select
                  value={newActivity.type}
                  onValueChange={(v) => setNewActivity({ ...newActivity, type: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full rounded-xl justify-start">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {newActivity.scheduled_date 
                        ? format(new Date(newActivity.scheduled_date), 'MMMM d, yyyy')
                        : 'Schedule date (optional)'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newActivity.scheduled_date ? new Date(newActivity.scheduled_date) : undefined}
                      onSelect={(date) => setNewActivity({ 
                        ...newActivity, 
                        scheduled_date: date ? format(date, 'yyyy-MM-dd') : '' 
                      })}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}

            <Button
              onClick={() => {
                if (activeTab === 'beauty') {
                  handleAddRoutineStep();
                } else {
                  createActivityMutation.mutate(newActivity);
                }
              }}
              disabled={activeTab === 'beauty' ? !newStep.trim() : !newActivity.name.trim()}
              className={cn(
                'w-full rounded-xl h-12 text-white',
                activeTab === 'beauty'
                  ? beautyTab === 'morning'
                    ? 'bg-gradient-to-r from-slate-600 to-slate-700'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500'
                  : 'bg-slate-700 hover:bg-slate-800'
              )}
            >
              {activeTab === 'beauty' ? 'Add to Routine' : 'Save Activity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PointsPopup
        points={pointsEarned}
        show={showPoints}
        onComplete={() => setShowPoints(false)}
      />
    </div>
  );
}