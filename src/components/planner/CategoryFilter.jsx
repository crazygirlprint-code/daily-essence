import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Home, Baby, Heart, ShoppingBag, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'kids', label: 'Kids', icon: Baby },
  { id: 'self-care', label: 'Self-care', icon: Heart },
  { id: 'errands', label: 'Errands', icon: ShoppingBag },
];

export default function CategoryFilter({ selected, onChange, taskCounts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = selected === cat.id;
        const count = cat.id === 'all' 
          ? Object.values(taskCounts).reduce((a, b) => a + b, 0)
          : taskCounts[cat.id] || 0;
        
        return (
          <motion.button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
              isActive
               ? 'bg-slate-800 dark:bg-gradient-to-r dark:from-rose-600 dark:to-pink-600 text-white shadow-lg shadow-slate-200 dark:shadow-rose-500/30'
               : 'bg-white dark:bg-neutral-800/30 text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-neutral-700/30 border border-slate-200 dark:border-rose-500/20'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold',
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              )}>
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}