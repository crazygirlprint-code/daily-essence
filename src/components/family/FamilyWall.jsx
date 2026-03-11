import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Sparkles, MessageCircle, Trash2, Pin, X, Loader2, Image as ImageIcon, Bell, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const POST_TYPES = [
  { id: 'note', label: 'Family Note', icon: MessageCircle, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'memory', label: 'Memory', icon: Camera, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'reminder', label: 'Reminder', icon: Bell, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'milestone', label: 'Milestone', icon: Award, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

export default function FamilyWall() {
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('note');
  const [selectedMember, setSelectedMember] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['familyPosts'],
    queryFn: () => base44.entities.FamilyPost.list('-created_date'),
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyPosts'] });
      setNewPost('');
      setPostType('note');
      setSelectedMember('');
      setImageUrl('');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      setPostType('memory');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      createMutation.mutate({
        message: newPost,
        type: postType,
        image_url: imageUrl || null,
        family_member: selectedMember || null,
        pinned: false
      });
    }
  };

  const togglePin = (post) => {
    updateMutation.mutate({
      id: post.id,
      data: { ...post, pinned: !post.pinned }
    });
  };

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(p => p.pinned);
  const regularPosts = posts.filter(p => !p.pinned);

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/50"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share a family note, memory, or reminder..."
            className="resize-none border-stone-200/50 focus:border-slate-400 rounded-xl"
            rows={3}
          />
          
          {/* Post Type Selector */}
          <div className="grid grid-cols-4 gap-2">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl transition-all border',
                    postType === type.id ? type.color : 'bg-white border-stone-200 text-slate-400 hover:bg-stone-50'
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Family Member Selector */}
          {familyMembers.length > 0 && (
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="rounded-xl border-stone-200/50">
                <SelectValue placeholder="About someone? (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>General / Everyone</SelectItem>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Image Upload */}
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden w-24 h-24 border border-stone-200/50">
                <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200/50 transition-colors">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" strokeWidth={1.5} />
                      <span className="text-sm text-slate-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                      <span className="text-sm text-slate-600">Add Photo</span>
                    </>
                  )}
                </div>
              </label>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!newPost.trim() || createMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
          >
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Post to Family Wall
          </Button>
        </form>
      </motion.div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pinned</h3>
          </div>
          {pinnedPosts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onTogglePin={togglePin}
              onDelete={deleteMutation.mutate}
              onImageClick={setExpandedImage}
            />
          ))}
        </div>
      )}

      {/* Regular Posts Feed */}
      <AnimatePresence mode="popLayout">
        {regularPosts.map((post, index) => (
          <PostItem
            key={post.id}
            post={post}
            onTogglePin={togglePin}
            onDelete={deleteMutation.mutate}
            onImageClick={setExpandedImage}
            delay={index * 0.05}
          />
        ))}
      </AnimatePresence>

      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-stone-300"
        >
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Your Family Wall</h3>
          <p className="text-slate-500">Start capturing family notes, memories, and milestones!</p>
        </motion.div>
      )}

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={expandedImage}
              alt="Memory"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostItem({ post, onTogglePin, onDelete, onImageClick, delay = 0 }) {
  const typeConfig = POST_TYPES.find(t => t.id === post.type) || POST_TYPES[0];
  const Icon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay }}
      className={cn(
        'bg-stone-100/50 rounded-2xl p-6 shadow-sm border border-stone-200/50 group',
        post.pinned && 'ring-2 ring-amber-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('px-3 py-1 rounded-lg text-sm font-medium border', typeConfig.color)}>
            <Icon className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
            {typeConfig.label}
          </div>
          {post.family_member && (
            <span className="px-3 py-1 bg-white rounded-lg text-sm text-slate-600 border border-stone-200/50">
              {post.family_member}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(post)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              post.pinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-stone-100 text-slate-400'
            )}
            title={post.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this post?')) {
                onDelete(post.id);
              }
            }}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p className="text-slate-700 leading-relaxed mb-3">{post.message}</p>

      {/* Image */}
      {post.image_url && (
        <div 
          onClick={() => onImageClick(post.image_url)}
          className="mb-3 rounded-xl overflow-hidden bg-stone-100 cursor-pointer hover:opacity-90 transition-opacity border border-stone-200/50"
        >
          <img src={post.image_url} alt="Memory" className="w-full h-48 object-cover" />
        </div>
      )}

      <p className="text-xs text-slate-400">
        {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
      </p>
    </motion.div>
  );
}