import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Mail, Calendar, Image as ImageIcon, Video, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatAdmin() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['allChatMessages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ChatMessage.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allChatMessages'] });
    },
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    responded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.session_id]) {
      acc[msg.session_id] = [];
    }
    acc[msg.session_id].push(msg);
    return acc;
  }, {});

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-900 dark:text-rose-100 mb-2">
            Access Denied
          </h1>
          <p className="text-stone-600 dark:text-rose-200">
            Admin access required to view chat messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-stone-900 dark:text-rose-100 mb-2">
            Chat Messages
          </h1>
          <p className="text-stone-600 dark:text-rose-200">
            {Object.keys(groupedMessages).length} conversation sessions • {messages.length} total messages
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-3">
            {Object.entries(groupedMessages).map(([sessionId, sessionMessages]) => {
              const latestMsg = sessionMessages[0];
              const pendingCount = sessionMessages.filter(m => m.status === 'pending').length;
              
              return (
                <motion.div
                  key={sessionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedMessage?.session_id === sessionId
                        ? 'border-slate-700 dark:border-rose-500 shadow-md'
                        : ''
                    }`}
                    onClick={() => setSelectedMessage(latestMsg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-rose-400 dark:to-pink-600 flex items-center justify-center text-white font-semibold">
                            {latestMsg.sender_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 dark:text-rose-100 text-sm">
                              {latestMsg.sender_name}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-rose-300">
                              {sessionMessages.length} message{sessionMessages.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {pendingCount > 0 && (
                          <Badge className="bg-amber-600 dark:bg-rose-600 text-white">
                            {pendingCount} new
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-rose-200 line-clamp-2 mb-2">
                        {latestMsg.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-rose-300">
                        <Calendar className="w-3 h-3" />
                        {new Date(latestMsg.created_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-serif">
                        Conversation with {selectedMessage.sender_name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-stone-600 dark:text-rose-200">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedMessage.sender_email}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupedMessages[selectedMessage.session_id]
                    ?.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-stone-50 dark:bg-slate-900/50 rounded-lg p-4 border border-stone-200 dark:border-rose-500/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[msg.status]}>
                              {msg.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {msg.status === 'read' && <Check className="w-3 h-3 mr-1" />}
                              {msg.status === 'responded' && <Check className="w-3 h-3 mr-1" />}
                              {msg.status}
                            </Badge>
                            <span className="text-xs text-stone-500 dark:text-rose-300">
                              {new Date(msg.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {msg.status !== 'read' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ id: msg.id, status: 'read' })}
                              >
                                Mark Read
                              </Button>
                            )}
                            {msg.status !== 'responded' && (
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ id: msg.id, status: 'responded' })}
                                className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-800"
                              >
                                Mark Responded
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-stone-700 dark:text-rose-100 mb-3">{msg.message}</p>
                        {msg.media_urls?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {msg.media_urls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                {msg.media_types?.[idx] === 'image' ? (
                                  <img
                                    src={url}
                                    alt="Uploaded"
                                    className="rounded-lg w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ) : (
                                  <video
                                    src={url}
                                    controls
                                    className="rounded-lg w-full h-40 object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-stone-400 dark:text-rose-400 mx-auto mb-4" />
                  <p className="text-stone-600 dark:text-rose-200">
                    Select a conversation to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}