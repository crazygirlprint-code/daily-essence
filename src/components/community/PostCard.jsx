import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Flame, Trophy, Lightbulb, Image as ImageIcon, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const postTypeConfig = {
  streak: { icon: Flame, label: 'Streak', color: 'text-orange-500', bg: 'bg-orange-50' },
  accomplishment: { icon: Trophy, label: 'Accomplishment', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  journey: { icon: Lightbulb, label: 'Journey', color: 'text-blue-500', bg: 'bg-blue-50' },
  photo: { icon: ImageIcon, label: 'Photo', color: 'text-purple-500', bg: 'bg-purple-50' },
  motivation: { icon: Star, label: 'Motivation', color: 'text-rose-500', bg: 'bg-rose-50' },
};

export default function PostCard({ post, onLike, isLiked }) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const config = postTypeConfig[post.post_type];
  const TypeIcon = config.icon;

  return (
    <>
    <AnimatePresence>
      {imageExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setImageExpanded(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={() => setImageExpanded(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            src={post.image_url}
            alt="Expanded"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-purple-900/30 dark-luxury:bg-slate-800/50 rounded-2xl p-6 border border-stone-200 dark:border-rose-500/30 dark-luxury:border-slate-700/50 shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-slate-900">{post.author_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
          </p>
        </div>
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', config.bg, config.color)}>
          <TypeIcon className="w-4 h-4" />
          {config.label}
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <div 
          onClick={() => setImageExpanded(true)}
          className="mb-4 rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img src={post.image_url} alt="Post" className="w-full h-64 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-stone-100">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLike}
          className={cn(
            'flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all',
            isLiked
              ? 'text-rose-500 bg-rose-50'
              : 'text-slate-500 hover:bg-slate-50'
          )}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          {post.likes}
        </motion.button>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all">
          <MessageCircle className="w-4 h-4" />
          Encourage
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:bg-slate-50 px-3 py-2 rounded-lg transition-all">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </motion.div>
    </>
  );
}