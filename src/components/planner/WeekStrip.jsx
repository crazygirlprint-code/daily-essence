import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function WeekStrip({ selectedDate, onDateSelect, tasksByDate = {} }) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const taskCount = tasksByDate[dateKey] || 0;
        const isSelected = isSameDay(day, selectedDate);
        const today = isToday(day);
        
        return (
          <motion.button
            key={dateKey}
            onClick={() => onDateSelect(day)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex flex-col items-center min-w-[4rem] py-3 px-2 rounded-2xl transition-all',
              isSelected
                ? 'bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-200'
                : today
                  ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            )}
          >
            <span className={cn(
              'text-xs font-medium uppercase',
              isSelected ? 'text-white/80' : 'text-slate-400'
            )}>
              {format(day, 'EEE')}
            </span>
            <span className="text-xl font-bold mt-1">
              {format(day, 'd')}
            </span>
            {taskCount > 0 && (
              <div className={cn(
                'flex gap-0.5 mt-2',
              )}>
                {Array.from({ length: Math.min(taskCount, 4) }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full',
                      isSelected ? 'bg-white/60' : 'bg-rose-400'
                    )}
                  />
                ))}
                {taskCount > 4 && (
                  <span className={cn(
                    'text-[10px] ml-0.5',
                    isSelected ? 'text-white/60' : 'text-rose-400'
                  )}>
                    +{taskCount - 4}
                  </span>
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}