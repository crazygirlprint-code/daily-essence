import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Heart, ShoppingBag, UtensilsCrossed, Film, 
  TreePine, Users, Palette, Plus, Check, Calendar, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function SelfCare() {
  const [isAddOpen, setIsAddOpen] = useState(false);
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
  
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['selfCareActivities'],
    queryFn: () => base44.entities.SelfCareActivity.list('-created_date')
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SelfCareActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selfCareActivities'] });
      setIsAddOpen(false);
      setNewActivity({ name: '', type: 'spa', scheduled_date: '', notes: '' });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SelfCareActivity.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['selfCareActivities'] })
  });
  
  const handleComplete = async (activity) => {
    await updateMutation.mutateAsync({
      id: activity.id,
      data: { completed: true }
    });
    
    const result = await addPoints('self_care');
    setPointsEarned(result.pointsEarned);
    setShowPoints(true);
  };
  
  const randomSuggestion = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  
  const upcomingActivities = activities.filter(a => !a.completed && a.scheduled_date);
  const completedActivities = activities.filter(a => a.completed);
  const unscheduledActivities = activities.filter(a => !a.completed && !a.scheduled_date);
  
  // Check if user needs a reminder
  const lastSelfCare = completedActivities[0];
  const daysSinceLastSelfCare = lastSelfCare 
    ? differenceInDays(new Date(), new Date(lastSelfCare.updated_date || lastSelfCare.created_date))
    : 30;
  const needsReminder = daysSinceLastSelfCare > 14;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-medium text-slate-700">Self-Care</span>
          </div>
          <p className="text-slate-500">You deserve time for yourself</p>
        </div>
        
        {/* Reminder Banner */}
        {needsReminder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl p-4 mb-6 text-white"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Time for some self-love! 💖</h3>
                <p className="text-sm text-white/90 mt-1">
                  It's been {daysSinceLastSelfCare}+ days since your last self-care activity. 
                  Schedule something special for yourself!
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Suggestion Card */}
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6"
          >
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm font-medium">Suggestion for you</span>
            </div>
            <p className="text-slate-700 font-medium">{randomSuggestion}</p>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => {
                  setNewActivity({ ...newActivity, name: randomSuggestion });
                  setIsAddOpen(true);
                }}
                className="rounded-xl bg-rose-500 hover:bg-rose-600"
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
        
        {/* Activity Type Quick Add */}
        <div className="grid grid-cols-4 gap-3 mb-8">
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
        
        {/* Upcoming Activities */}
        {upcomingActivities.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
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
                      <h4 className="font-medium text-slate-800">{activity.name}</h4>
                      <p className="text-sm text-slate-500">
                        {format(new Date(activity.scheduled_date), 'EEEE, MMMM d')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleComplete(activity)}
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
        
        {/* Ideas/Unscheduled */}
        {unscheduledActivities.length > 0 && (
          <div className="mb-8">
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
        
        {/* Completed */}
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
        
        {/* Add Button */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl bg-gradient-to-r from-rose-400 to-pink-500"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Plan Self-Care Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="What will you do?"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              className="rounded-xl"
            />
            
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
            
            <Button
              onClick={() => createMutation.mutate(newActivity)}
              disabled={!newActivity.name.trim()}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-rose-400 to-pink-500"
            >
              Save Activity
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