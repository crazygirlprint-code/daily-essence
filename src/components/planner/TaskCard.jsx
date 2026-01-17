import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Flag, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import CategoryBadge from './CategoryBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import ShareButton from '@/components/family/ShareButton';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-slate-300'
};

export default function TaskCard({ task, onToggle, onDelete, onEdit }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'group relative bg-stone-100/50 rounded-2xl p-4 border border-slate-100',
        'shadow-sm hover:shadow-md transition-all duration-300',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task)}
            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              'font-medium text-slate-800 leading-snug',
              task.completed && 'line-through text-slate-400'
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ShareButton item={task} itemType="task" />
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 hover:bg-slate-100 rounded-lg">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task)} className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <CategoryBadge category={task.category} />
            
            {task.due_time && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                {task.due_time}
              </span>
            )}
            
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(task.created_date), { addSuffix: true })}
            </span>
            
            {task.family_member && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {task.family_member}
              </span>
            )}
          </div>
          
          {task.notes && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{task.notes}</p>
          )}
        </div>
        
        <div className={cn(
          'w-2 h-2 rounded-full flex-shrink-0 mt-2',
          priorityColors[task.priority]
        )} title={`${task.priority} priority`} />
      </div>
    </motion.div>
  );
}