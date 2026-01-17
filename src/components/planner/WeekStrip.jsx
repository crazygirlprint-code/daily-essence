import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/hooks/useTheme';

const getWeatherIcon = (iconCode) => {
  if (!iconCode) return '☀️';
  // OpenWeather icon mapping
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌧️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[iconCode] || '☀️';
};

export default function WeekStrip({ selectedDate, onDateSelect, tasksByDate = {}, forecast = [] }) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {days.map((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const taskCount = tasksByDate[dateKey] || 0;
        const isSelected = isSameDay(day, selectedDate);
        const today = isToday(day);
        const weatherForDay = forecast[index];
        
        return (
          <motion.button
            key={dateKey}
            onClick={() => onDateSelect(day)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex flex-col items-center min-w-[4.5rem] py-3 px-2 rounded-lg transition-all',
                isSelected
                  ? 'bg-slate-700 dark:bg-gradient-to-br dark:from-rose-600 dark:to-pink-600 text-white shadow-lg dark:shadow-rose-500/30'
                  : today
                    ? 'bg-amber-50 dark:bg-rose-950/40 text-slate-700 dark:text-rose-300 border border-amber-200/60 dark:border-rose-500/50'
                    : 'bg-white/50 text-stone-700 hover:bg-stone-50 border border-stone-300'
            )}
            title={weatherForDay ? `${weatherForDay.description} ${Math.round(weatherForDay.temp)}°C` : ''}
          >
            <span className="text-lg mb-0.5">
              {getWeatherIcon(weatherForDay?.icon)}
            </span>
            <span className={cn(
              'text-[9px] font-medium uppercase tracking-widest mb-0.5',
                isSelected ? 'text-white/90' : 'text-stone-500 dark:text-stone-400'
            )}>
              {format(day, 'EEE')}
            </span>
            <span className="text-xl font-serif">
              {format(day, 'd')}
            </span>
            {taskCount > 0 && (
              <div className={cn(
                'flex gap-0.5 mt-1.5',
              )}>
                {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                          'w-1 h-1 rounded-full',
                               isSelected ? 'bg-white dark:bg-pink-300' : 'bg-slate-600 dark:bg-rose-400'
                        )}
                  />
                ))}
                {taskCount > 3 && (
                  <span className={cn(
                    'text-[9px] ml-0.5 font-serif',
                    isSelected ? 'text-white dark:text-pink-300' : 'text-slate-600 dark:text-rose-400'
                  )}>
                    +{taskCount - 3}
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