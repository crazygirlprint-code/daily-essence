import React from 'react';
import { Briefcase, Home, Baby, Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig = {
  work: {
    icon: Briefcase,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  home: {
    icon: Home,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200'
  },
  kids: {
    icon: Baby,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  'self-care': {
    icon: Heart,
    bg: 'bg-rose-50',
    text: 'text-rose-500',
    border: 'border-rose-200'
  },
  errands: {
    icon: ShoppingBag,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200'
  }
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const config = categoryConfig[category] || categoryConfig.home;
  const Icon = config.icon;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium capitalize',
      config.bg, config.text, config.border,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {category}
    </span>
  );
}

export { categoryConfig };