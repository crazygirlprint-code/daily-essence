import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Home, Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from '@/components/community/PostCard';
import CreatePostDialog from '@/components/community/CreatePostDialog';

export default function Community() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userLikes, setUserLikes] = useState({});

  const queryClient = useQueryClient();

  // Fetch current user
  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch community posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date'),
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create({
      ...data,
      author_name: user?.full_name || 'Anonymous',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setIsCreateOpen(false);
    },
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (post) => {
      const isCurrentlyLiked = post.liked_by?.includes(user?.email);
      const updatedLikedBy = isCurrentlyLiked
        ? post.liked_by.filter(email => email !== user?.email)
        : [...(post.liked_by || []), user?.email];

      return base44.entities.CommunityPost.update(post.id, {
        likes: updatedLikedBy.length,
        liked_by: updatedLikedBy,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  const handleLike = (post) => {
    if (user) {
      likeMutation.mutate(post);
      setUserLikes(prev => ({
        ...prev,
        [post.id]: !prev[post.id]
      }));
    }
  };

  // Group posts by type
  const postsByType = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (!acc[post.post_type]) acc[post.post_type] = [];
      acc[post.post_type].push(post);
      return acc;
    }, {});
  }, [posts]);

  const typeLabels = {
    streak: '🔥 Streaks',
    accomplishment: '🏆 Accomplishments',
    journey: '💡 Journeys',
    photo: '📸 Photos',
    motivation: '⭐ Motivation',
  };

  return (
     <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-stone-50/50 to-white dark:bg-transparent">
       <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
         {/* Header */}
         <div className="flex items-center justify-between mb-8">
           <Link to={createPageUrl('Home')}>
             <Button variant="ghost" size="icon" className="rounded-xl">
               <Home className="w-5 h-5" />
             </Button>
           </Link>

           <div className="text-center flex-1">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-stone-100">Community</h1>
             <p className="text-sm text-slate-500 dark:text-stone-400 mt-1">Share your journey with moms like you</p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 dark:from-rose-400 dark:to-pink-500 hover:from-slate-700 hover:to-slate-800 dark:hover:from-rose-500 dark:hover:to-pink-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Posts by Type */}
        <div className="space-y-12">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 text-stone-200 dark:text-rose-900/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-stone-200 mb-2">No posts yet</h3>
              <p className="text-slate-400 dark:text-stone-400 mb-6">Be the first to share your story with the community!</p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 dark:from-rose-400 dark:to-pink-500 hover:from-slate-700 hover:to-slate-800 dark:hover:from-rose-500 dark:hover:to-pink-600 text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share Your First Post
              </Button>
            </motion.div>
          ) : (
            <>
              {Object.entries(typeLabels).map(([type, label]) => {
                const typePosts = postsByType[type];
                if (!typePosts || typePosts.length === 0) return null;

                return (
                  <div key={type}>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{label}</h2>
                    <div className="space-y-4">
                      {typePosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onLike={() => handleLike(post)}
                          isLiked={post.liked_by?.includes(user?.email)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}