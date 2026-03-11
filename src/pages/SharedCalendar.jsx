import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SharedCalendar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedCalendar = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setError('No share token provided');
          setLoading(false);
          return;
        }

        const response = await base44.functions.invoke('getSharedCalendar', { token });
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load calendar');
      } finally {
        setLoading(false);
      }
    };

    loadSharedCalendar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200/50 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-serif text-slate-900 mb-2">Unable to Load Calendar</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const { ownerName, tasks = [], events = [], familyMembers = [] } = data || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50/40 via-stone-50/50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
            <Calendar className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            <span className="font-medium text-slate-700">Shared Family Calendar</span>
          </div>
          <h1 className="text-3xl font-serif text-slate-900">{ownerName}'s Family</h1>
          <p className="text-slate-600 mt-2">View-only calendar access</p>
        </motion.div>

        {/* Family Members */}
        {familyMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/50 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              <h2 className="font-semibold text-slate-700">Family Members</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{member.relationship}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/50 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
              <h2 className="font-semibold text-slate-700">Special Events</h2>
            </div>
            <div className="space-y-3">
              {events.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                  <span className="text-2xl">{event.emoji || '⭐'}</span>
                  <div>
                    <p className="font-medium text-slate-700">{event.title}</p>
                    <p className="text-sm text-slate-500">{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</p>
                    {event.notes && <p className="text-sm text-slate-600 mt-1">{event.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              <h2 className="font-semibold text-slate-700">Upcoming Tasks</h2>
            </div>
            <div className="space-y-2">
              {tasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{task.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-slate-500">{format(parseISO(task.due_date), 'MMM d')}</span>
                      {task.family_member && (
                        <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">
                          {task.family_member}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full capitalize">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tasks.length === 0 && events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slate-600">No upcoming tasks or events</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>This is a read-only view • Contact {ownerName} to request changes</p>
        </div>
      </div>
    </div>
  );
}