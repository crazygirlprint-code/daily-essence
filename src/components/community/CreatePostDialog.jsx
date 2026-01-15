import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flame, Trophy, Lightbulb, Image as ImageIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const postTypes = [
  { value: 'streak', label: 'Share Your Streak', icon: Flame },
  { value: 'accomplishment', label: 'Accomplishment', icon: Trophy },
  { value: 'journey', label: 'My Journey', icon: Lightbulb },
  { value: 'photo', label: 'Photo', icon: ImageIcon },
  { value: 'motivation', label: 'Motivation', icon: Star },
];

export default function CreatePostDialog({ isOpen, onOpenChange, onSubmit, isLoading }) {
  const [postType, setPostType] = useState('accomplishment');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit({
        post_type: postType,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
      });
      setContent('');
      setImageUrl('');
      setPostType('accomplishment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Share Your Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Post Type Selector */}
          <div>
            <p className="text-sm text-slate-600 mb-2 font-medium">What are you sharing?</p>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPostType(type.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      postType === type.value
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-slate-600 font-medium block mb-2">Your Message</label>
            <Textarea
              placeholder="Share your accomplishment, streak, journey or motivation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl min-h-24"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm text-slate-600 font-medium block mb-2">Image URL (optional)</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading}
            className="w-full rounded-xl h-12 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium"
          >
            {isLoading ? 'Sharing...' : 'Share with Community'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}