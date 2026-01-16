import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Gift, Heart, Calendar as CalIcon, Star, Trash2, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import ShareButton from '@/components/family/ShareButton';
import EmojiPicker from '@/components/events/EmojiPicker';

const EVENT_TYPES = {
  birthday: { icon: Gift, color: 'bg-pink-500', bgLight: 'bg-pink-100 text-pink-700' },
  anniversary: { icon: Heart, color: 'bg-rose-500', bgLight: 'bg-rose-100 text-rose-700' },
  holiday: { icon: Star, color: 'bg-amber-500', bgLight: 'bg-amber-100 text-amber-700' },
  appointment: { icon: CalIcon, color: 'bg-blue-500', bgLight: 'bg-blue-100 text-blue-700' },
  other: { icon: Star, color: 'bg-slate-500', bgLight: 'bg-slate-100 text-slate-700' }
};

export default function Events() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'other',
    notes: '',
    emoji: '',
    recurring_yearly: false,
    color: ''
  });
  
  const queryClient = useQueryClient();

  // Check subscription status
  React.useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Admin users and premium subscribers can use emojis
      setIsPremium(u?.subscription_tier === 'premium' || u?.role === 'admin');
    }).catch(() => {});
  }, []);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['specialEvents'],
    queryFn: () => base44.entities.SpecialEvent.list()
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SpecialEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
      setIsAddOpen(false);
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        notes: '',
        emoji: '',
        recurring_yearly: false,
        color: ''
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SpecialEvent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialEvents'] });
      setIsAddOpen(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        notes: '',
        emoji: '',
        recurring_yearly: false,
        color: ''
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SpecialEvent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialEvents'] })
  });
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;
  
  // Get events for a specific day (including recurring)
  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMonth = format(day, 'MM-dd');
    
    return events.filter(event => {
      if (event.date === dayStr) return true;
      if (event.recurring_yearly && event.date?.slice(5) === dayMonth) return true;
      return false;
    });
  };
  
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const eventsForSelectedDate = getEventsForDay(selectedDate);
  
  // Upcoming events
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const upcoming = events
      .map(event => {
        let eventDate = parseISO(event.date);
        if (event.recurring_yearly) {
          const thisYear = new Date(today.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          if (thisYear < today) {
            eventDate = new Date(today.getFullYear() + 1, eventDate.getMonth(), eventDate.getDate());
          } else {
            eventDate = thisYear;
          }
        }
        return { ...event, nextDate: eventDate };
      })
      .filter(e => e.nextDate >= today)
      .sort((a, b) => a.nextDate - b.nextDate)
      .slice(0, 5);
    return upcoming;
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Special Events</h1>
          <p className="text-slate-500 mt-1">Never miss an important date</p>
        </div>
        
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              Coming Up
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {upcomingEvents.map((event) => {
                const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.other;
                const Icon = typeInfo.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl',
                      typeInfo.bgLight
                    )}
                    >
                      {event.emoji ? (
                        <span className="text-2xl">{event.emoji}</span>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs opacity-75">
                          {format(event.nextDate, 'MMM d')}
                          {event.recurring_yearly && ' • Yearly'}
                        </p>
                      </div>
                    </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const today = isToday(day);
              
              return (
                <motion.button
                  key={format(day, 'yyyy-MM-dd')}
                  onClick={() => setSelectedDate(day)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative',
                    isSelected 
                      ? 'bg-gradient-to-br from-indigo-500 dark:from-rose-500 dark:to-pink-600 dark-luxury:from-amber-600 dark-luxury:to-amber-700 to-purple-500 text-white shadow-lg dark:shadow-rose-500/30 dark-luxury:shadow-amber-500/30'
                      : today
                        ? 'bg-indigo-50 dark:bg-rose-950/40 dark-luxury:bg-amber-900/30 text-indigo-600 dark:text-rose-300 dark-luxury:text-amber-400 ring-2 ring-indigo-200 dark:ring-rose-500/50 dark-luxury:ring-amber-500/50'
                        : 'hover:bg-slate-50 dark:hover:bg-neutral-800/30 dark-luxury:hover:bg-amber-900/10 text-slate-700 dark:text-stone-400 dark-luxury:text-slate-300'
                  )}
                >
                  <span className="text-sm font-semibold mt-1">
                    {format(day, 'd')}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        event.emoji ? (
                          <motion.span
                            key={idx}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                            className="text-xs"
                          >
                            {event.emoji}
                          </motion.span>
                        ) : (
                          <span
                            key={idx}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-white/70' : (EVENT_TYPES[event.type] || EVENT_TYPES.other).color
                            )}
                          />
                        )
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Date Events */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <Button
              size="sm"
              onClick={() => {
                setNewEvent({ ...newEvent, date: format(selectedDate, 'yyyy-MM-dd') });
                setIsAddOpen(true);
              }}
              className="rounded-xl bg-gradient-to-r from-indigo-500 dark:from-rose-600 dark:to-pink-600 dark-luxury:from-amber-600 dark-luxury:to-amber-700 to-purple-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          </div>
          
          {eventsForSelectedDate.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {eventsForSelectedDate.map((event) => {
                const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.other;
                const Icon = typeInfo.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="group flex items-center gap-4 p-4 bg-slate-50 rounded-xl transition-all"
                  >
                    {event.emoji ? (
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-3xl"
                      >
                        {event.emoji}
                      </motion.div>
                    ) : (
                      <div className={cn('p-3 rounded-xl', typeInfo.bgLight)}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {event.notes && (
                          <p className="text-sm text-slate-500">{event.notes}</p>
                        )}
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      {event.recurring_yearly && (
                        <span className="text-xs text-indigo-500 font-medium mt-1">Repeats yearly</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ShareButton item={event} itemType="event" />
                       <button
                         onClick={() => {
                           setEditingEvent(event);
                           setNewEvent(event);
                           setIsAddOpen(true);
                         }}
                         className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                       >
                         <Pencil className="w-4 h-4 text-blue-400" />
                       </button>
                       <button
                         onClick={() => deleteMutation.mutate(event.id)}
                         className="p-2 hover:bg-red-50 rounded-lg transition-all"
                       >
                         <Trash2 className="w-4 h-4 text-red-400" />
                       </button>
                     </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) {
          setEditingEvent(null);
          setNewEvent({
            title: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            type: 'other',
            notes: '',
            emoji: '',
            recurring_yearly: false,
            color: ''
          });
        }
      }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Special Event' : 'Add Special Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="rounded-xl"
            />
            
            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
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
                <SelectItem value="birthday">🎁 Birthday</SelectItem>
                <SelectItem value="anniversary">❤️ Anniversary</SelectItem>
                <SelectItem value="holiday">⭐ Holiday</SelectItem>
                <SelectItem value="appointment">📅 Appointment</SelectItem>
                <SelectItem value="other">📌 Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder="Notes (optional)"
              value={newEvent.notes}
              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
              className="rounded-xl"
              rows={2}
            />

            {isPremium && (
              <div>
                <label className="text-sm text-slate-600 font-medium block mb-2">
                  Emoji or Sticker
                </label>
                <EmojiPicker
                  value={newEvent.emoji}
                  onChange={(emoji) => setNewEvent({ ...newEvent, emoji })}
                  isPremium={true}
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={newEvent.recurring_yearly}
                onCheckedChange={(checked) => setNewEvent({ ...newEvent, recurring_yearly: checked })}
              />
              <Label htmlFor="recurring" className="text-sm text-slate-600">
                Repeat every year
              </Label>
            </div>
            
            <Button
              onClick={() => {
                if (editingEvent) {
                  updateMutation.mutate({ id: editingEvent.id, data: newEvent });
                } else {
                  createMutation.mutate(newEvent);
                }
              }}
              disabled={!newEvent.title.trim() || !newEvent.date}
              className="w-full rounded-xl h-12 bg-gradient-to-r from-indigo-500 dark:from-rose-600 dark:to-pink-600 dark-luxury:from-amber-600 dark-luxury:to-amber-700 to-purple-500"
            >
              {editingEvent ? 'Update Event' : 'Save Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}