import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Smile, Camera, Sparkles, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

const POST_TYPES = [
  { id: 'update', label: 'Update', icon: MessageCircle, color: 'text-blue-500' },
  { id: 'photo', label: 'Photo', icon: Camera, color: 'text-purple-500' },
  { id: 'reminder', label: 'Reminder', icon: Sparkles, color: 'text-amber-500' },
  { id: 'celebration', label: 'Celebration', icon: Heart, color: 'text-rose-500' },
];

const REACTION_EMOJIS = ['❤️', '👍', '😊', '🎉', '👏', '💪'];

export default function FamilyWall() {
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('update');
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['familyPosts'],
    queryFn: () => base44.entities.FamilyPost.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyPosts'] });
      setNewPost('');
      setPostType('update');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyPost.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyPosts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['familyPosts'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      createMutation.mutate({
        message: newPost,
        type: postType,
        reactions: []
      });
    }
  };

  const handleReaction = (post, emoji) => {
    const reactions = post.reactions || [];
    const userEmail = user?.email;
    
    // Check if user already reacted with this emoji
    const existingIndex = reactions.findIndex(r => r.user === userEmail && r.emoji === emoji);
    
    let newReactions;
    if (existingIndex >= 0) {
      // Remove reaction
      newReactions = reactions.filter((_, i) => i !== existingIndex);
    } else {
      // Add reaction (remove other reactions from this user first)
      newReactions = [...reactions.filter(r => r.user !== userEmail), { user: userEmail, emoji }];
    }
    
    updateMutation.mutate({
      id: post.id,
      data: { ...post, reactions: newReactions }
    });
  };

  const getReactionCounts = (reactions = []) => {
    return reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with your family..."
            className="resize-none border-slate-200 focus:border-purple-400"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={`p-2 rounded-lg transition-all ${
                      postType === type.id
                        ? 'bg-purple-100 ' + type.color
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            
            <Button
              type="submit"
              disabled={!newPost.trim() || createMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Posts Feed */}
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => {
          const typeConfig = POST_TYPES.find(t => t.id === post.type) || POST_TYPES[0];
          const Icon = typeConfig.icon;
          const reactionCounts = getReactionCounts(post.reactions);
          const userReaction = post.reactions?.find(r => r.user === user?.email)?.emoji;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold`}>
                    {post.created_by?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{post.created_by?.split('@')[0] || 'User'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Icon className={`w-3 h-3 ${typeConfig.color}`} />
                      <span>{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                {post.created_by === user?.email && (
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed mb-3">{post.message}</p>

              {/* Reactions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(post, emoji)}
                      className={`px-2 py-1 rounded-lg text-base transition-all hover:bg-slate-50 ${
                        userReaction === emoji ? 'bg-purple-50 ring-1 ring-purple-200' : ''
                      }`}
                    >
                      {emoji}
                      {reactionCounts[emoji] > 0 && (
                        <span className="text-xs text-slate-500 ml-1">{reactionCounts[emoji]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">No posts yet. Start sharing with your family!</p>
        </motion.div>
      )}
    </div>
  );
}