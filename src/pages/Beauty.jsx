import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Plus, Check, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useGamification } from '@/components/gamification/useGamification';
import PointsPopup from '@/components/gamification/PointsPopup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export default function Beauty() {
  const [activeTab, setActiveTab] = useState('morning');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStep, setNewStep] = useState('');
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const queryClient = useQueryClient();
  const { addPoints } = useGamification();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data: routines = [], isLoading } = useQuery({
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
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BeautyRoutine.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] });
      setIsAddOpen(false);
      setNewStep('');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BeautyRoutine.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] })
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BeautyRoutine.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beautyRoutines'] })
  });
  
  const morningRoutines = routines
    .filter(r => r.type === 'morning')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const nightRoutines = routines
    .filter(r => r.type === 'night')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const currentRoutines = activeTab === 'morning' ? morningRoutines : nightRoutines;
  
  const completedToday = (routine) => routine.last_completed === today;
  
  const completedCount = currentRoutines.filter(r => completedToday(r)).length;
  const totalCount = currentRoutines.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  const handleToggle = async (routine) => {
    const isCompleting = !completedToday(routine);
    await updateMutation.mutateAsync({
      id: routine.id,
      data: {
        completed_today: isCompleting,
        last_completed: isCompleting ? today : null
      }
    });
    
    if (isCompleting) {
      const result = await addPoints('beauty_routine');
      setPointsEarned(result.pointsEarned);
      setShowPoints(true);
    }
  };
  
  const handleAddStep = () => {
    if (!newStep.trim()) return;
    const maxOrder = Math.max(...currentRoutines.map(r => r.order || 0), 0);
    createMutation.mutate({
      name: newStep,
      type: activeTab,
      order: maxOrder + 1,
      completed_today: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="font-medium text-slate-700">Beauty Routines</span>
          </div>
          <p className="text-slate-500">Your daily glow-up ritual</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white/50 rounded-2xl p-1 mb-6">
            <TabsTrigger
              value="morning"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
            >
              <Sun className="w-4 h-4 mr-2" />
              Morning
            </TabsTrigger>
            <TabsTrigger
              value="night"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Moon className="w-4 h-4 mr-2" />
              Night
            </TabsTrigger>
          </TabsList>
          
          {/* Progress Card */}
          <div className={cn(
            'rounded-2xl p-6 mb-6 text-white',
            activeTab === 'morning' 
              ? 'bg-gradient-to-r from-amber-400 to-orange-400'
              : 'bg-gradient-to-r from-indigo-400 to-purple-500'
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
          
          {/* Routine Steps */}
          <div className="space-y-3">
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
                      : activeTab === 'morning'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-indigo-100 text-indigo-600'
                  )}>
                    {completedToday(routine) ? <Check className="w-4 h-4" /> : index + 1}
                  </span>
                  
                  <span className={cn(
                    'flex-1 font-medium',
                    completedToday(routine) ? 'text-green-700 line-through' : 'text-slate-700'
                  )}>
                    {routine.name}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={completedToday(routine)}
                      onCheckedChange={() => handleToggle(routine)}
                      className="w-6 h-6 rounded-lg"
                    />
                    <button
                      onClick={() => deleteMutation.mutate(routine.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Add Step Button */}
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="outline"
            className="w-full mt-4 rounded-2xl h-14 border-dashed border-2 hover:bg-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Step
          </Button>
        </Tabs>
      </div>
      
      {/* Add Step Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add {activeTab === 'morning' ? 'Morning' : 'Night'} Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="e.g., Apply face mask"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
            />
            <Button
              onClick={handleAddStep}
              disabled={!newStep.trim()}
              className={cn(
                'w-full rounded-xl h-12',
                activeTab === 'morning'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                  : 'bg-gradient-to-r from-indigo-400 to-purple-500'
              )}
            >
              Add to Routine
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