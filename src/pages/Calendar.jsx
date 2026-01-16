import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import TaskCard from '@/components/planner/TaskCard';
import { categoryConfig } from '@/components/planner/CategoryBadge';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad the beginning to align with week days
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;
  
  // Tasks grouped by date
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (task.due_date) {
        if (!acc[task.due_date]) acc[task.due_date] = [];
        acc[task.due_date].push(task);
      }
      return acc;
    }, {});
  }, [tasks]);
  
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const tasksForSelectedDate = tasksByDate[selectedDateStr] || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent dark-luxury:bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h1 className="text-xl font-bold text-slate-800 min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="rounded-xl"
          >
            Today
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 shadow-sm mb-6">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateStr] || [];
              const incompleteTasks = dayTasks.filter(t => !t.completed);
              const isSelected = isSameDay(day, selectedDate);
              const today = isToday(day);
              
              return (
                <motion.button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative',
                    isSelected 
                      ? 'bg-gradient-to-br from-amber-500 dark:from-rose-500 dark:to-pink-600 to-amber-600 text-white shadow-lg dark:shadow-rose-500/30'
                      : today
                        ? 'bg-amber-50 dark:bg-rose-950/40 text-amber-700 dark:text-rose-300 ring-2 ring-amber-200 dark:ring-rose-500/50'
                        : 'hover:bg-stone-50 dark:hover:bg-neutral-800/30 text-slate-700 dark:text-stone-400'
                  )}
                >
                  <span className={cn(
                    'text-sm font-semibold mt-1',
                    isSelected && 'text-white'
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {incompleteTasks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center mt-1 max-w-full">
                      {incompleteTasks.slice(0, 3).map((task, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            isSelected 
                              ? 'bg-white/70' 
                              : task.priority === 'high' 
                                ? 'bg-red-400' 
                                : task.priority === 'medium' 
                                  ? 'bg-amber-400' 
                                  : 'bg-slate-300'
                          )}
                        />
                      ))}
                      {incompleteTasks.length > 3 && (
                        <span className={cn(
                          'text-[8px] font-medium',
                          isSelected ? 'text-white/70' : 'text-slate-400'
                        )}>
                          +{incompleteTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Tasks for selected date */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {format(selectedDate, 'EEEE, MMMM d')}
            <span className="text-slate-400 font-normal ml-2">
              {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
            </span>
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence>
              {tasksForSelectedDate.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-slate-400"
                >
                  No tasks scheduled for this day
                </motion.div>
              ) : (
                tasksForSelectedDate.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onEdit={() => {}}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}