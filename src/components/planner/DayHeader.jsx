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
        <Icon className={`w-4 h-4 ${greeting.color}`} strokeWidth={1.5} />
        <span className="text-stone-600 text-xs font-medium uppercase tracking-widest">{greeting.text}, {firstName}</span>
      </div>
      
      <h1 className="text-4xl font-serif text-neutral-900 tracking-tight leading-tight">
        {getDateLabel(date)}
      </h1>
      
      <p className="text-stone-500 text-sm mt-1.5 uppercase tracking-widest font-light">
        {format(date, 'MMMM d, yyyy')}
      </p>
    </div>
  );
}