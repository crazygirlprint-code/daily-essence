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
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-5 h-5 ${greeting.color}`} />
        <span className="text-slate-500 text-sm font-medium">{greeting.text}, {firstName}</span>
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
        {getDateLabel(date)}
      </h1>
      
      <p className="text-slate-400 text-sm mt-1">
        {format(date, 'MMMM d, yyyy')}
      </p>
    </div>
  );
}