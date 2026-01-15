import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import DayHeader from '@/components/planner/DayHeader';
import WeekStrip from '@/components/planner/WeekStrip';
import StatsCard from '@/components/planner/StatsCard';
import CategoryFilter from '@/components/planner/CategoryFilter';
import TaskCard from '@/components/planner/TaskCard';
import QuickAddTask from '@/components/planner/QuickAddTask';
import EmptyState from '@/components/planner/EmptyState';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const queryClient = useQueryClient();
  
  // Fetch current user
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });
  
  // Fetch family members
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
  
  // Filter tasks by selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const tasksForDate = useMemo(() => {
    return tasks.filter(t => t.due_date === selectedDateStr);
  }, [tasks, selectedDateStr]);
  
  // Filter by category
  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'all') return tasksForDate;
    return tasksForDate.filter(t => t.category === selectedCategory);
  }, [tasksForDate, selectedCategory]);
  
  // Sort tasks: incomplete first, then by priority
  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTasks]);
  
  // Calculate task counts per category
  const taskCounts = useMemo(() => {
    return tasksForDate.reduce((acc, task) => {
      if (!task.completed) {
        acc[task.category] = (acc[task.category] || 0) + 1;
      }
      return acc;
    }, {});
  }, [tasksForDate]);
  
  // Calculate tasks per date for the week strip
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (task.due_date && !task.completed) {
        acc[task.due_date] = (acc[task.due_date] || 0) + 1;
      }
      return acc;
    }, {});
  }, [tasks]);
  
  const handleToggleTask = (task) => {
    updateMutation.mutate({ id: task.id, data: { completed: !task.completed } });
  };
  
  const handleDeleteTask = (task) => {
    deleteMutation.mutate(task.id);
  };
  
  const handleAddTask = (taskData) => {
    createMutation.mutate({ ...taskData, completed: false });
  };
  
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const allTasksDone = tasksForDate.length > 0 && pendingTasks.length === 0 && selectedCategory === 'all';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <DayHeader date={selectedDate} userName={user?.full_name} />
        
        <div className="mb-6">
          <WeekStrip 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasksByDate={tasksByDate}
          />
        </div>
        
        {isToday(selectedDate) && tasksForDate.length > 0 && (
          <div className="mb-6">
            <StatsCard tasks={tasksForDate} />
          </div>
        )}
        
        <div className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
            taskCounts={taskCounts}
          />
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedTasks.length === 0 ? (
              <EmptyState type={allTasksDone ? 'all-done' : 'no-tasks'} />
            ) : (
              sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={() => {}}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Floating Add Button */}
      <motion.div
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-xl shadow-rose-200 text-white"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 md:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-rose-500">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Today</span>
          </button>
          <Link to={createPageUrl('Calendar')} className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Calendar</span>
          </Link>
          <Link to={createPageUrl('Family')} className="flex flex-col items-center gap-1 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Family</span>
          </Link>
        </div>
      </div>
      
      <QuickAddTask
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddTask}
        familyMembers={familyMembers}
      />
    </div>
  );
}