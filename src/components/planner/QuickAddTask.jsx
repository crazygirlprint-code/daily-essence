import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Clock, Flag, Tag, Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/components/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function QuickAddTask({ onAdd, familyMembers = [], isOpen, onOpenChange }) {
  const [task, setTask] = useState({
    title: '',
    category: 'home',
    priority: 'medium',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    due_time: '',
    notes: '',
    family_member: ''
  });
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechRecognition();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) return;
    onAdd(task);
    setTask({
      title: '',
      category: 'home',
      priority: 'medium',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      due_time: '',
      notes: '',
      family_member: ''
    });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:w-full md:max-w-lg px-0 md:px-4"
          >
            <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto pb-32 md:pb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Add Task</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <Input
                    placeholder="What needs to be done?"
                    value={task.title || (isListening ? transcript : '')}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    className="text-lg border-0 border-b border-slate-200 rounded-none px-0 pr-10 focus-visible:ring-0 focus-visible:border-rose-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => isListening ? (stopListening(), setTask({ ...task, title: transcript })) : startListening()}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Select value={task.category} onValueChange={(v) => setTask({ ...task, category: v })}>
                    <SelectTrigger className="rounded-xl">
                      <Tag className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="self-care">Self-care</SelectItem>
                      <SelectItem value="errands">Errands</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={task.priority} onValueChange={(v) => setTask({ ...task, priority: v })}>
                    <SelectTrigger className="rounded-xl">
                      <Flag className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-xl justify-start">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {task.due_date ? format(new Date(task.due_date + 'T00:00:00'), 'MMM d') : 'Date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={task.due_date ? new Date(task.due_date + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setTask({ ...task, due_date: `${year}-${month}-${day}` });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Input
                    type="time"
                    value={task.due_time}
                    onChange={(e) => setTask({ ...task, due_time: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                
                {familyMembers.length > 0 && (
                  <Select value={task.family_member} onValueChange={(v) => setTask({ ...task, family_member: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Assign to family member" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value={null}>None</SelectItem>
                       {familyMembers.map((member) => (
                         <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                )}
                
                <div className="relative">
                  <Textarea
                    placeholder="Add notes..."
                    value={task.notes}
                    onChange={(e) => setTask({ ...task, notes: e.target.value })}
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => isListening ? (stopListening(), setTask({ ...task, notes: task.notes + ' ' + transcript }), clearTranscript()) : startListening()}
                    className={`absolute right-3 top-3 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                
                <Button
                  type="submit"
                  className="w-full rounded-xl h-12 bg-slate-700 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-500/30 dark:bg-gradient-to-r dark:from-rose-500 dark:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-700 dark:shadow-rose-500/40"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Task
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}