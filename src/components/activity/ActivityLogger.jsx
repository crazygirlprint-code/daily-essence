import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/components/hooks/useSpeechRecognition';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const activityTypes = [
  { value: 'mindful_walking', label: '🚶 Mindful Walking' },
  { value: 'journaling', label: '📝 Journaling' },
  { value: 'social_connection', label: '👥 Social Connection' },
  { value: 'healthy_meal', label: '🥗 Healthy Meal' },
  { value: 'creative_hobby', label: '🎨 Creative Hobby' },
  { value: 'other', label: '✨ Other' },
];

const moodOptions = [
  { value: 'very_low', label: 'Very Low' },
  { value: 'low', label: 'Low' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
];

export default function ActivityLogger({ onSubmit, onClose, preselectedType, prefilledTitle = '' }) {
  const [formData, setFormData] = useState({
    type: preselectedType || 'mindful_walking',
    title: prefilledTitle,
    duration_minutes: '',
    notes: '',
    mood_before: 'neutral',
    mood_after: 'neutral',
    energy_level: 5,
    activity_date: new Date().toISOString().split('T')[0],
    family_member: '',
  });
  
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });
  
  const { isListening, transcript, error, startListening, stopListening, clearTranscript } = useSpeechRecognition();
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (!isListening && transcript && activeField) {
      if (activeField === 'title') {
        setFormData((prev) => ({
          ...prev,
          title: prev.title + (prev.title && transcript ? ' ' : '') + transcript,
        }));
      } else if (activeField === 'notes') {
        setFormData((prev) => ({
          ...prev,
          notes: prev.notes + (prev.notes && transcript ? ' ' : '') + transcript,
        }));
      }
      clearTranscript();
      setActiveField(null);
    }
  }, [isListening, transcript, clearTranscript, activeField]);

  const handleMicClick = (field) => {
    if (isListening) {
      stopListening();
    } else {
      setActiveField(field);
      startListening();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      energy_level: parseInt(formData.energy_level),
      logged_at: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-rose-950/30 dark:backdrop-blur-xl rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-rose-500/40 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-neutral-900 dark:text-rose-100">Log Activity</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-rose-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Activity Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
             <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Activity Title</label>
             <div className="relative">
               <Input
                 placeholder="e.g., Morning walk in the park"
                 value={formData.title}
                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 className="mt-1 pr-10"
                 required
               />
               <button
                 type="button"
                 onClick={() => handleMicClick('title')}
                 className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${isListening && activeField === 'title' ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Mic className={`w-4 h-4 ${isListening && activeField === 'title' ? 'animate-pulse' : ''}`} />
               </button>
             </div>
             {error && (
               <p className="text-xs text-red-600 dark:text-red-400 mt-1">Error: {error}</p>
             )}
             {isListening && (
               <p className="text-xs text-slate-600 dark:text-rose-300 mt-1">Listening... {transcript && `"${transcript}"`}</p>
             )}
           </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Duration (min)</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Date</label>
              <Input
                type="date"
                value={formData.activity_date}
                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Mood Before</label>
            <Select value={formData.mood_before} onValueChange={(value) => setFormData({ ...formData, mood_before: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moodOptions.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>{mood.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Mood After</label>
            <Select value={formData.mood_after} onValueChange={(value) => setFormData({ ...formData, mood_after: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moodOptions.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>{mood.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Energy Level</label>
              <span className="text-sm font-semibold text-amber-600 dark:text-rose-400">{formData.energy_level}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: e.target.value })}
              className="w-full"
            />
          </div>

          {familyMembers.length > 0 && (
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Family Member (Optional)</label>
              <Select value={formData.family_member} onValueChange={(value) => setFormData({ ...formData, family_member: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} ({member.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
              <label className="text-sm font-medium text-stone-700 dark:text-rose-200">Notes</label>
              <div className="relative">
                <Textarea
                  placeholder="How did this activity make you feel? What did you learn?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 h-24"
                />
                <button
                  type="button"
                  onClick={() => handleMicClick('notes')}
                  className={`absolute right-3 top-3 p-1 transition-colors ${isListening && activeField === 'notes' ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Mic className={`w-4 h-4 ${isListening && activeField === 'notes' ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Error: {error}</p>
              )}
              {isListening && (
                <p className="text-xs text-slate-600 dark:text-stone-300 mt-1">Listening... {transcript && `"${transcript}"`}</p>
              )}
            </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-slate-700 hover:bg-slate-800 text-white dark:bg-gradient-to-r dark:from-rose-500 dark:to-pink-500 dark:hover:from-rose-600 dark:hover:to-pink-600">
             Log Activity
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}