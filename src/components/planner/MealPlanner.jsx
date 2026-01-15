import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Coffee, Sun, Moon, Cookie, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'lunch', name: 'Lunch', icon: Sun, color: 'bg-orange-100 text-orange-600' },
  { id: 'dinner', name: 'Dinner', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'snack', name: 'Snacks', icon: Cookie, color: 'bg-pink-100 text-pink-600' },
];

export default function MealPlanner({ selectedDate, onAddPoints }) {
  const [newMeal, setNewMeal] = useState({ type: '', name: '' });
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: meals = [] } = useQuery({
    queryKey: ['mealPlans', dateStr],
    queryFn: () => base44.entities.MealPlan.filter({ date: dateStr })
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      setNewMeal({ type: '', name: '' });
      if (onAddPoints) await onAddPoints('meal_plan');
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
  });
  
  const getMealForType = (type) => meals.find(m => m.meal_type === type);
  
  const handleAddMeal = (type) => {
    if (!newMeal.name.trim() || newMeal.type !== type) return;
    createMutation.mutate({
      date: dateStr,
      meal_type: type,
      meal_name: newMeal.name
    });
  };

  return (
    <div className="space-y-3">
      {MEAL_TYPES.map((mealType) => {
        const Icon = mealType.icon;
        const existingMeal = getMealForType(mealType.id);
        const isAddingThis = newMeal.type === mealType.id;
        
        return (
          <motion.div
            key={mealType.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
          >
            <div className={cn('p-2 rounded-lg', mealType.color)}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">{mealType.name}</p>
              {existingMeal ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {existingMeal.meal_name}
                  </p>
                  <button
                    onClick={() => deleteMutation.mutate(existingMeal.id)}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ) : isAddingThis ? (
                <div className="flex gap-2">
                  <Input
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    placeholder={`Add ${mealType.name.toLowerCase()}...`}
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMeal(mealType.id)}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddMeal(mealType.id)}
                    className="h-8"
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setNewMeal({ type: mealType.id, name: '' })}
                  className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add meal
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}