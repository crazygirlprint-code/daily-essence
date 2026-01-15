import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Pin, Trash2, X, Mic } from 'lucide-react';
import { useSpeechRecognition } from '@/components/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'pink', bg: 'bg-pink-50', border: 'border-pink-200' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'green', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' },
];

export default function QuickNotes({ compact = false }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: 'yellow' });
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechRecognition();
  const queryClient = useQueryClient();
  
  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-created_date')
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsAddOpen(false);
      setNewNote({ title: '', content: '', color: 'yellow' });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });
  
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
  
  const getColorClasses = (colorId) => {
    return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {sortedNotes.slice(0, 3).map((note) => {
          const colorClasses = getColorClasses(note.color);
          return (
            <div
              key={note.id}
              className={cn(
                'p-3 rounded-xl border',
                colorClasses.bg, colorClasses.border
              )}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-slate-700 text-sm">{note.title}</h4>
                {note.pinned && <Pin className="w-3 h-3 text-slate-400 fill-slate-400" />}
              </div>
              {note.content && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.content}</p>
              )}
            </div>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="w-full rounded-xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </Button>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Input
                  placeholder="Title"
                  value={newNote.title || (isListening ? transcript : '')}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => isListening ? (stopListening(), setNewNote({ ...newNote, title: transcript }), clearTranscript()) : startListening()}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Write your note..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="rounded-xl"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => isListening ? (stopListening(), setNewNote({ ...newNote, content: newNote.content + ' ' + transcript }), clearTranscript()) : startListening()}
                  className={`absolute right-3 top-3 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
              </div>
              <div className="flex gap-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setNewNote({ ...newNote, color: color.id })}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all',
                      color.bg,
                      newNote.color === color.id ? 'ring-2 ring-slate-400' : ''
                    )}
                  />
                ))}
              </div>
              <Button
                onClick={() => createMutation.mutate(newNote)}
                disabled={!newNote.title.trim()}
                className="w-full rounded-xl bg-slate-800"
              >
                Save Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-500" />
          Notes
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {sortedNotes.map((note, index) => {
            const colorClasses = getColorClasses(note.color);
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'group relative p-4 rounded-2xl border',
                  colorClasses.bg, colorClasses.border
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-700">{note.title}</h4>
                  <button
                    onClick={() => updateMutation.mutate({
                      id: note.id,
                      data: { pinned: !note.pinned }
                    })}
                    className="p-1"
                  >
                    <Pin className={cn(
                      'w-4 h-4',
                      note.pinned ? 'text-slate-600 fill-slate-600' : 'text-slate-300'
                    )} />
                  </button>
                </div>
                {note.content && (
                  <p className="text-sm text-slate-600 line-clamp-3">{note.content}</p>
                )}
                <button
                  onClick={() => deleteMutation.mutate(note.id)}
                  className="absolute bottom-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
             <div className="relative">
               <Input
                 placeholder="Title"
                 value={newNote.title || (isListening ? transcript : '')}
                 onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                 className="rounded-xl pr-10"
               />
               <button
                 type="button"
                 onClick={() => isListening ? (stopListening(), setNewNote({ ...newNote, title: transcript }), clearTranscript()) : startListening()}
                 className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
               </button>
             </div>
             <div className="relative">
               <Textarea
                 placeholder="Write your note..."
                 value={newNote.content}
                 onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                 className="rounded-xl"
                 rows={4}
               />
               <button
                 type="button"
                 onClick={() => isListening ? (stopListening(), setNewNote({ ...newNote, content: newNote.content + ' ' + transcript }), clearTranscript()) : startListening()}
                 className={`absolute right-3 top-3 p-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
               </button>
             </div>
            <div className="flex gap-2">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setNewNote({ ...newNote, color: color.id })}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all',
                    color.bg,
                    newNote.color === color.id ? 'ring-2 ring-slate-400' : ''
                  )}
                />
              ))}
            </div>
            <Button
              onClick={() => createMutation.mutate(newNote)}
              disabled={!newNote.title.trim()}
              className="w-full rounded-xl bg-slate-800"
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}