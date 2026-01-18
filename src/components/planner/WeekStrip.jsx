import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const convertTemperature = (celsius, unit) => {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9/5) + 32);
  }
  return Math.round(celsius);
};

export default function WeekStrip({ selectedDate, onDateSelect, tasksByDate = {}, forecast = [], temperatureUnit = 'fahrenheit' }) {
  const [weekOffset, setWeekOffset] = useState(0);
  
  // Calculate the week start, allowing navigation backwards and forwards
  const firstForecastDate = forecast.length > 0 ? new Date(forecast[0].date) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Allow going back 7 days from today
  const minWeekOffset = Math.ceil((firstForecastDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)) - 1;
  
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Map forecast data by date key for easy lookup
  const forecastByDate = forecast.reduce((acc, item) => {
    acc[item.date] = item;
    return acc;
  }, {});
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset(prev => Math.max(prev - 1, minWeekOffset))}
          disabled={weekOffset <= minWeekOffset}
          className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-medium">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
        </span>
        <button
          onClick={() => setWeekOffset(prev => prev + 1)}
          disabled={days[6] > new Date(forecast[forecast.length - 1]?.date || today)}
          className="p-2 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      {days.map((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const taskCount = tasksByDate[dateKey] || 0;
        const isSelected = isSameDay(day, selectedDate);
        const today = isToday(day);
        const weatherForDay = forecastByDate[dateKey];
        
        return (
          <motion.button
            key={dateKey}
            onClick={() => onDateSelect(day)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex flex-col items-center min-w-[4.5rem] py-3 px-2 rounded-lg transition-all',
                isSelected
                  ? 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-rose-500 dark:via-pink-500 dark:to-rose-600 text-white shadow-lg shadow-slate-500/40 dark:shadow-rose-500/40'
                  : today
                    ? 'bg-amber-50 dark:bg-stone-50 text-slate-700 dark:text-slate-800 border border-amber-200/60 dark:border-stone-200'
                    : 'bg-white/50 text-stone-700 hover:bg-stone-50 border border-stone-300 dark:bg-stone-50 dark:border-stone-200 dark:text-slate-800 dark:hover:bg-stone-100'
            )}
            title={weatherForDay ? `${weatherForDay.description} ${convertTemperature(weatherForDay.temp, temperatureUnit)}°${temperatureUnit === 'fahrenheit' ? 'F' : 'C'}` : ''}
          >
            <span className="text-lg mb-0.5">
              {getWeatherIcon(weatherForDay?.icon)}
            </span>
            {weatherForDay && (
              <span className={cn(
                'text-xs font-semibold mb-1',
                isSelected ? 'text-white' : 'text-stone-700 dark:text-stone-400'
              )}>
                {`${convertTemperature(weatherForDay.temp, temperatureUnit)}°`}
              </span>
            )}
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
      </div>
      );
      }