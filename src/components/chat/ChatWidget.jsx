import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Image as ImageIcon, Video, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ChatWidget({ isEmbedded = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => base44.entities.ChatMessage.filter({ session_id: sessionId }, '-created_date'),
    enabled: isOpen,
  });

  const createMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
      setMessage('');
      setMediaFiles([]);
    },
  });

  useEffect(() => {
    if (user) {
      setSenderName(user.full_name || '');
      setSenderEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(files.map(f => f.name));

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        return { url: file_url, type, name: file.name };
      });

      const uploaded = await Promise.all(uploadPromises);
      setMediaFiles([...mediaFiles, ...uploaded]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && mediaFiles.length === 0) return;
    if (!senderName.trim() || !senderEmail.trim()) {
      alert('Please provide your name and email');
      return;
    }

    await createMessageMutation.mutateAsync({
      message: message.trim() || 'Media attachment',
      sender_name: senderName,
      sender_email: senderEmail,
      media_urls: mediaFiles.map(f => f.url),
      media_types: mediaFiles.map(f => f.type),
      session_id: sessionId,
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  if (!isOpen && !isEmbedded) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-rose-500 dark:to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`${isEmbedded ? 'w-full h-full' : 'fixed bottom-6 right-6 z-50 w-96 h-[600px]'} bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-rose-500/40 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-rose-500 dark:to-pink-600 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg">Daily Essence Support</h3>
            <p className="text-xs text-white/80">We're here to help</p>
          </div>
          {!isEmbedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!user && (
            <div className="space-y-2 mb-4 p-3 bg-amber-50 dark:bg-rose-950/30 rounded-lg border border-amber-200 dark:border-rose-500/30">
              <Input
                placeholder="Your name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="text-sm"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-rose-400 dark:to-pink-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {msg.sender_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-stone-700 dark:text-rose-200">
                      {msg.sender_name}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-rose-300/60">
                      {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-stone-100 dark:bg-rose-950/40 rounded-lg rounded-tl-none p-3">
                    <p className="text-sm text-stone-800 dark:text-rose-100">{msg.message}</p>
                    {msg.media_urls?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.media_urls.map((url, idx) => (
                          <div key={idx}>
                            {msg.media_types?.[idx] === 'image' ? (
                              <img src={url} alt="Uploaded" className="rounded-lg max-w-full" />
                            ) : (
                              <video src={url} controls className="rounded-lg max-w-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-stone-200 dark:border-rose-500/30">
            <div className="flex gap-2 overflow-x-auto">
              {mediaFiles.map((file, idx) => (
                <div key={idx} className="relative flex-shrink-0">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-16 h-16 rounded object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-stone-200 dark:bg-rose-950/40 flex items-center justify-center">
                      <Video className="w-6 h-6 text-stone-600 dark:text-rose-300" />
                    </div>
                  )}
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-600 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 dark:border-rose-500/30">
          <div className="flex items-end gap-2">
            <input
              type="file"
              id="chat-media-upload"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => document.getElementById('chat-media-upload').click()}
              disabled={uploadingFiles.length > 0}
              className="flex-shrink-0"
            >
              {uploadingFiles.length > 0 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </Button>
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={createMessageMutation.isPending || (!message.trim() && mediaFiles.length === 0)}
              className="flex-shrink-0 bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-800"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}