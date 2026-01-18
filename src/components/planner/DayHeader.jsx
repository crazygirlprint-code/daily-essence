import React from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Sun, Moon, CloudSun, Sparkles } from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun, color: 'text-amber-500' };
  if (hour < 17) return { text: 'Good afternoon', icon: CloudSun, color: 'text-orange-500' };
  return { text: 'Good evening', icon: Moon, color: 'text-indigo-500' };
}

function getDateLabel(date) {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE');
}

export default function DayHeader({ date, userName }) {
  const greeting = getGreeting();
  const Icon = greeting.icon;
  const firstName = userName?.split(' ')[0] || 'there';
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
         <Icon className={`w-5 h-5 ${greeting.color}`} strokeWidth={1.5} />
         <span className="text-slate-800 dark:text-white dark-luxury:text-amber-200 text-base font-semibold uppercase tracking-widest">{greeting.text}, {firstName}</span>
       </div>

       <h1 className="text-4xl font-serif text-neutral-900 dark:text-stone-100 dark-luxury:text-amber-50 tracking-tight leading-tight">
         {getDateLabel(date)}
       </h1>

       <p className="text-slate-700 dark:text-white/80 dark-luxury:text-amber-200/70 text-sm mt-1.5 uppercase tracking-widest font-semibold">
         {format(date, 'MMMM d, yyyy')}
       </p>
    </div>
  );
}