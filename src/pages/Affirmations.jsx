import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Heart, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/components/audio/useTextToSpeech';
import { useGamification } from '@/components/gamification/useGamification';
import PointsPopup from '@/components/gamification/PointsPopup';

const DEFAULT_AFFIRMATIONS = [
  { text: "I am worthy of love, success, and happiness.", category: "confidence" },
  { text: "I am strong, capable, and can handle anything that comes my way.", category: "strength" },
  { text: "I choose peace and calm in every situation.", category: "peace" },
  { text: "I am grateful for all the blessings in my life.", category: "gratitude" },
  { text: "I attract success and abundance effortlessly.", category: "success" },
  { text: "I love myself unconditionally.", category: "love" },
  { text: "I am becoming the best version of myself every day.", category: "confidence" },
  { text: "I release all negativity and embrace positivity.", category: "peace" },
  { text: "I am deserving of all the good things life has to offer.", category: "success" },
  { text: "I am surrounded by love and support.", category: "love" },
  { text: "My potential is limitless.", category: "confidence" },
  { text: "I choose to be happy and spread joy to others.", category: "gratitude" }
];

const categoryColors = {
  confidence: 'from-purple-400 to-indigo-500',
  gratitude: 'from-amber-400 to-orange-500',
  strength: 'from-rose-400 to-pink-500',
  peace: 'from-cyan-400 to-blue-500',
  success: 'from-emerald-400 to-teal-500',
  love: 'from-pink-400 to-rose-500'
};

export default function Affirmations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const { speak, stop, isSpeaking, isPaused, pause, resume } = useTextToSpeech();
  const { addPoints } = useGamification();
  const queryClient = useQueryClient();
  
  const { data: affirmations = [], isLoading } = useQuery({
    queryKey: ['affirmations'],
    queryFn: async () => {
      const existing = await base44.entities.Affirmation.list();
      if (existing.length === 0) {
        // Seed with default affirmations
        await base44.entities.Affirmation.bulkCreate(DEFAULT_AFFIRMATIONS);
        return await base44.entities.Affirmation.list();
      }
      return existing;
    }
  });
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => 
      base44.entities.Affirmation.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['affirmations'] })
  });
  
  const currentAffirmation = affirmations[currentIndex] || DEFAULT_AFFIRMATIONS[0];
  
  const handleNext = () => {
    stop();
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
  };
  
  const handlePrev = () => {
    stop();
    setCurrentIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
  };
  
  const handleListen = async () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(currentAffirmation.text, {
        rate: 0.85,
        onEnd: async () => {
          const result = await addPoints('affirmation_listen');
          setPointsEarned(result.pointsEarned);
          setShowPoints(true);
        }
      });
    }
  };
  
  const handleRandom = () => {
    stop();
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentIndex(randomIndex);
  };
  
  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-slate-700">Daily Affirmations</span>
          </div>
          <p className="text-slate-500">Speak kindness to yourself every day</p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'relative rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden',
              'bg-gradient-to-br',
              categoryColors[currentAffirmation.category] || categoryColors.confidence
            )}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleFavoriteMutation.mutate({
                  id: currentAffirmation.id,
                  is_favorite: currentAffirmation.is_favorite
                })}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Heart className={cn(
                  'w-6 h-6',
                  currentAffirmation.is_favorite ? 'fill-white text-white' : 'text-white/70'
                )} />
              </button>
            </div>
            
            <div className="relative z-10 text-center">
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-white leading-relaxed">
                "{currentAffirmation.text}"
              </p>
              
              <div className="mt-8">
                <Button
                  onClick={handleListen}
                  size="lg"
                  className={cn(
                    'rounded-full px-8 py-6 text-lg font-medium shadow-xl transition-all',
                    isSpeaking 
                      ? 'bg-white text-purple-600 hover:bg-white/90' 
                      : 'bg-white/20 text-white border-2 border-white/50 hover:bg-white/30'
                  )}
                >
                  {isSpeaking && !isPaused ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      Listen to Affirmation
                    </>
                  )}
                </Button>
              </div>
              
              <p className="mt-6 text-white/70 text-sm capitalize">
                {currentAffirmation.category}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="rounded-full w-12 h-12 bg-white shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRandom}
            className="rounded-full px-6 bg-white shadow-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Random
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full w-12 h-12 bg-white shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {affirmations.slice(0, 12).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                stop();
                setCurrentIndex(idx);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentIndex ? 'bg-rose-500 w-6' : 'bg-slate-300 hover:bg-slate-400'
              )}
            />
          ))}
        </div>
        
        {/* Favorites Section */}
        {affirmations.some(a => a.is_favorite) && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Your Favorites
            </h3>
            <div className="space-y-3">
              {affirmations.filter(a => a.is_favorite).map((aff, idx) => (
                <motion.button
                  key={aff.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setCurrentIndex(affirmations.findIndex(a => a.id === aff.id))}
                  className="w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  <p className="text-slate-700">"{aff.text}"</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize">{aff.category}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <PointsPopup 
        points={pointsEarned} 
        show={showPoints} 
        onComplete={() => setShowPoints(false)} 
      />
    </div>
  );
}