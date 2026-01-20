import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Video, X, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function ChatWidget({ sessionId, onSessionUpdate }) {
  const [message, setMessage] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentSessionId = sessionId || crypto.randomUUID();

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['chatMessages', currentSessionId],
    queryFn: () => base44.entities.ChatMessage.filter({ session_id: currentSessionId }, '-created_date'),
    refetchInterval: 3000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles = [];
      
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          alert('Only images and videos are allowed');
          continue;
        }

        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({
          url: file_url,
          type: isImage ? 'image' : 'video',
          filename: file.name
        });
      }

      setMediaFiles([...mediaFiles, ...uploadedFiles]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && mediaFiles.length === 0) return;

    setSending(true);
    try {
      const { data } = await base44.functions.invoke('processChatMessage', {
        message: message.trim(),
        media_files: mediaFiles,
        session_id: currentSessionId
      });

      if (onSessionUpdate && data.session_id) {
        onSessionUpdate(data.session_id);
      }

      setMessage('');
      setMediaFiles([]);
      refetch();
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-4 border-b border-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">DE</span>
          </div>
          <div>
            <h3 className="font-serif text-white text-lg">Daily Essence Support</h3>
            <p className="text-xs text-slate-300">We're here to help</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.user_email ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.user_email ? 'bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'} rounded-2xl p-3 shadow-sm`}>
                {!msg.user_email && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Support Team</p>
                )}
                <p className="text-sm">{msg.message}</p>
                
                {msg.media_files && msg.media_files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.media_files.map((file, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden">
                        {file.type === 'image' ? (
                          <img src={file.url} alt={file.filename} className="max-w-full rounded-lg" />
                        ) : (
                          <video src={file.url} controls className="max-w-full rounded-lg" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {new Date(msg.created_date).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative group">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.filename} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/50">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            className="shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none min-h-[44px] max-h-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            onClick={handleSend}
            disabled={(!message.trim() && mediaFiles.length === 0) || sending}
            className="shrink-0 bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-800"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}