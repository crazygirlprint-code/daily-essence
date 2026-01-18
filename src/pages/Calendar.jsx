import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, isBefore } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'other',
    notes: '',
    emoji: '⭐',
    recurring_yearly: false
  });

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date'),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['specialEvents'],
    queryFn: () => base44.entities.SpecialEvent.list('-date'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.SpecialEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
      setShowEventDialog(false);
      setEditingEventId(null);
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        notes: '',
        emoji: '⭐',
        recurring_yearly: false
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SpecialEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
      setShowEventDialog(false);
      setEditingEventId(null);
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        notes: '',
        emoji: '⭐',
        recurring_yearly: false
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.SpecialEvent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialEvents'] }),
  });

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      if (task.due_date) {
        if (!grouped[task.due_date]) grouped[task.due_date] = [];
        grouped[task.due_date].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      if (event.date) {
        if (!grouped[event.date]) grouped[event.date] = [];
        grouped[event.date].push(event);
      }
    });
    return grouped;
  }, [events]);

  const selectedTasks = tasksByDate[selectedDate] || [];
  const incompleteTasks = selectedTasks.filter(t => !t.completed);
  const selectedEvents = eventsByDate[selectedDate] || [];

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const upcoming = events
      .map(event => {
        let eventDate = parseISO(event.date);
        if (event.recurring_yearly) {
          const thisYear = new Date(today.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          if (isBefore(thisYear, today)) {
            eventDate = new Date(today.getFullYear() + 1, eventDate.getMonth(), eventDate.getDate());
          } else {
            eventDate = thisYear;
          }
        }
        return { ...event, nextDate: eventDate };
      })
      .filter(e => !isBefore(e.nextDate, today))
      .sort((a, b) => a.nextDate - b.nextDate)
      .slice(0, 4);
    return upcoming;
  }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/40 via-stone-50/50 to-white dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Special Events Section */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white dark:bg-rose-950/20 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-rose-500/30 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-stone-100 mb-1">Special Events</h2>
              <p className="text-slate-500 dark:text-stone-400 text-sm">Never miss an important date</p>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-medium text-slate-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                Coming Up
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {upcomingEvents.map((event) => (
                  <motion.button
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedDate(event.date)}
                    className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-rose-900/20 dark:to-rose-900/10 border border-slate-200 dark:border-rose-500/30 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{event.emoji || '⭐'}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm text-slate-700 dark:text-stone-200">{event.title}</p>
                      <p className="text-xs text-slate-500 dark:text-stone-400">
                        {format(event.nextDate, 'MMM d')}
                        {event.recurring_yearly && ' • Yearly'}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-stone-100">Calendar</h1>
            <p className="text-slate-600 dark:text-stone-300 text-sm">Track your tasks and events</p>
          </div>
          <Button
            onClick={() => {
              setEditingEventId(null);
              setNewEvent({
                title: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                type: 'other',
                notes: '',
                emoji: '⭐',
                recurring_yearly: false
              });
              setShowEventDialog(true);
            }}
            className="bg-slate-600 hover:bg-slate-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-rose-950/20 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-rose-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-stone-400 pb-2">
                {day}
              </div>
            ))}

            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {daysInMonth.map((day) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              if (!isCurrentMonth) return null;

              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateStr] || [];
              const incompleteDayTasks = dayTasks.filter(t => !t.completed);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all',
                    isSelected
                      ? 'bg-slate-700 dark:bg-gradient-to-br dark:from-rose-500 dark:to-pink-600 text-white shadow-lg'
                      : isToday
                        ? 'bg-slate-100 dark:bg-rose-950/40 text-slate-700 dark:text-rose-300 ring-2 ring-slate-300 dark:ring-rose-500/50'
                        : 'hover:bg-slate-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-stone-300'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    isToday ? 'font-bold' : '',
                    isSelected ? 'text-white' : isCurrentMonth ? 'text-slate-700 dark:text-stone-200' : 'text-slate-400 dark:text-stone-500'
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {incompleteDayTasks.length > 0 && incompleteDayTasks.slice(0, 2).map((_, i) => (
                      <div key={`task-${i}`} className={cn(
                        'w-1 h-1 rounded-full',
                        isSelected ? 'bg-white' : 'bg-slate-500 dark:bg-slate-400'
                      )} />
                    ))}
                    {dayEvents.length > 0 && dayEvents.slice(0, 2).map((_, i) => (
                      <div key={`event-${i}`} className={cn(
                        'w-1 h-1 rounded-full',
                        isSelected ? 'bg-white' : 'bg-amber-500 dark:bg-rose-400'
                      )} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white dark:bg-rose-950/20 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-rose-500/30">
          <h3 className="font-semibold text-slate-700 dark:text-stone-100 mb-4">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h3>

          {/* Events Section */}
          {selectedEvents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500 dark:text-rose-400" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-stone-200">Events</h4>
              </div>
              <div className="space-y-2">
                {selectedEvents.map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-rose-900/20 rounded-lg border border-amber-200 dark:border-rose-500/30 group hover:bg-amber-100 dark:hover:bg-rose-900/30 cursor-pointer transition-colors"
                    onClick={() => {
                      setEditingEventId(event.id);
                      setNewEvent({
                        title: event.title,
                        date: event.date,
                        type: event.type,
                        notes: event.notes || '',
                        emoji: event.emoji || '⭐',
                        recurring_yearly: event.recurring_yearly || false
                      });
                      setShowEventDialog(true);
                    }}
                  >
                    <div className="text-2xl">{event.emoji || '⭐'}</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-stone-200">{event.title}</p>
                      {event.notes && (
                        <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">{event.notes}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-stone-500 mt-1 uppercase tracking-wider">
                        {event.type} {event.recurring_yearly && '• Recurring'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEventMutation.mutate(event.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {incompleteTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-slate-500 dark:text-stone-400" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-stone-200">Tasks</h4>
              </div>
              <div className="space-y-2">
                {incompleteTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-rose-900/20 rounded-lg border border-slate-100 dark:border-rose-500/20"
                  >
                    <button
                      onClick={() => updateTaskMutation.mutate({ 
                        id: task.id, 
                        data: { completed: !task.completed } 
                      })}
                      className="mt-0.5"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={cn(
                        'font-medium text-slate-700 dark:text-stone-200',
                        task.completed && 'line-through text-slate-400'
                      )}>
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">{task.notes}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-stone-500 mt-1 uppercase tracking-wider">
                        {task.category}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {incompleteTasks.length === 0 && selectedEvents.length === 0 && (
            <p className="text-slate-500 dark:text-stone-400 text-sm">No tasks or events for this day</p>
          )}
        </div>
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingEventId ? 'Edit Special Event' : 'Add Special Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="rounded-xl"
            />

            <Select
              value={newEvent.type}
              onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="anniversary">Anniversary</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="rounded-xl"
            />

            <Input
              placeholder="Emoji (e.g., 🎂, 🎉, 🎈)"
              value={newEvent.emoji}
              onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })}
              className="rounded-xl"
              maxLength={2}
            />

            <Textarea
              placeholder="Notes (optional)"
              value={newEvent.notes}
              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              className="rounded-xl"
            />

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={newEvent.recurring_yearly}
                onChange={(e) => setNewEvent({ ...newEvent, recurring_yearly: e.target.checked })}
                className="rounded"
              />
              Repeat every year
            </label>

            <Button
              onClick={() => {
                if (editingEventId) {
                  updateEventMutation.mutate({ id: editingEventId, data: newEvent });
                } else {
                  createEventMutation.mutate(newEvent);
                }
              }}
              disabled={!newEvent.title || !newEvent.date}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-slate-600 to-slate-700 dark:from-rose-500 dark:to-pink-600 hover:from-slate-700 hover:to-slate-800 dark:hover:from-rose-600 dark:hover:to-pink-700"
            >
              {editingEventId ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}