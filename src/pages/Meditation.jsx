import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Leaf, Wind, Moon, Heart, CloudSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTextToSpeech } from '@/components/audio/useTextToSpeech';
import { useGamification } from '@/components/gamification/useGamification';
import PointsPopup from '@/components/gamification/PointsPopup';

const MEDITATION_TYPES = [
  { id: 'breathing', name: 'Breathing', icon: Wind, color: 'from-cyan-400 to-blue-500' },
  { id: 'body_scan', name: 'Body Scan', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { id: 'gratitude', name: 'Gratitude', icon: CloudSun, color: 'from-amber-400 to-orange-500' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'from-indigo-400 to-purple-500' },
  { id: 'stress_relief', name: 'Stress Relief', icon: Leaf, color: 'from-emerald-400 to-teal-500' },
];

const DURATIONS = [10, 15, 20];

const GUIDED_SCRIPTS = {
  breathing: {
    intro: "Welcome to this breathing meditation. Find a comfortable position and gently close your eyes. Take a deep breath in, and slowly exhale.",
    instructions: [
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath gently for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Notice the calm spreading through your body",
      "Continue this rhythm at your own pace"
    ],
    closing: "You've done beautifully. Take one more deep breath, and when you're ready, gently open your eyes. Carry this peace with you."
  },
  body_scan: {
    intro: "Welcome to this body scan meditation. Lie down or sit comfortably. Close your eyes and bring awareness to your breath.",
    instructions: [
      "Focus on your feet, feel any tension melting away",
      "Move your attention to your legs, letting them relax",
      "Notice your hips and lower back, release any tightness",
      "Feel your chest and shoulders soften with each breath",
      "Relax your neck, jaw, and face completely"
    ],
    closing: "Your whole body is now relaxed. Take a moment to appreciate this stillness. When ready, slowly open your eyes."
  },
  gratitude: {
    intro: "Welcome to this gratitude meditation. Settle into a comfortable position and take a few calming breaths.",
    instructions: [
      "Think of something simple that brings you joy today",
      "Picture someone who has shown you kindness",
      "Feel grateful for your body and all it does for you",
      "Appreciate the roof over your head and food you've eaten",
      "Send gratitude to yourself for taking this time"
    ],
    closing: "Let this feeling of gratitude fill your heart. Carry this appreciation with you throughout your day."
  },
  sleep: {
    intro: "Welcome to this sleep meditation. Get comfortable in bed and allow your body to sink into the mattress.",
    instructions: [
      "Let go of any thoughts about tomorrow",
      "Feel your body becoming heavier and more relaxed",
      "Imagine a wave of warmth washing over you",
      "Your mind is becoming quiet and peaceful",
      "Drift into a restful, restorative sleep"
    ],
    closing: "Sleep well, knowing you are safe and at peace. Sweet dreams."
  },
  stress_relief: {
    intro: "Welcome to this stress relief meditation. Find a quiet space and take a moment to arrive in the present.",
    instructions: [
      "Acknowledge any stress without judgment",
      "Visualize stress leaving your body with each exhale",
      "Imagine a peaceful place where you feel completely safe",
      "Feel tension dissolving from your muscles",
      "Replace worry with trust that things will work out"
    ],
    closing: "You have released what no longer serves you. Take this calm energy with you. You've got this."
  }
};

export default function Meditation() {
  const [selectedType, setSelectedType] = useState(MEDITATION_TYPES[0]);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('idle'); // idle, intro, main, closing, complete
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { addPoints } = useGamification();
  const queryClient = useQueryClient();
  
  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.MeditationSession.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meditationSessions'] })
  });
  
  const script = GUIDED_SCRIPTS[selectedType.id];
  
  const startMeditation = () => {
    setIsPlaying(true);
    setTimeRemaining(selectedDuration * 60);
    setCurrentPhase('intro');
    
    if (audioEnabled) {
      speak(script.intro, {
        rate: 0.8,
        onEnd: () => {
          setCurrentPhase('main');
          startInstructions();
        }
      });
    } else {
      setTimeout(() => {
        setCurrentPhase('main');
      }, 3000);
    }
  };
  
  const startInstructions = () => {
    if (!audioEnabled) return;
    
    let instructionIndex = 0;
    const speakNextInstruction = () => {
      if (instructionIndex < script.instructions.length && isPlaying) {
        speak(script.instructions[instructionIndex], {
          rate: 0.75,
          onEnd: () => {
            instructionIndex++;
            phaseTimerRef.current = setTimeout(speakNextInstruction, 15000);
          }
        });
      }
    };
    
    phaseTimerRef.current = setTimeout(speakNextInstruction, 5000);
  };
  
  const pauseMeditation = () => {
    setIsPlaying(false);
    stop();
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
  };
  
  const resetMeditation = () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    setCurrentPhase('idle');
    stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
  };
  
  const completeMeditation = async () => {
    setCurrentPhase('closing');
    
    if (audioEnabled) {
      speak(script.closing, {
        rate: 0.8,
        onEnd: async () => {
          setCurrentPhase('complete');
          setIsPlaying(false);
          
          await saveMutation.mutateAsync({
            duration_minutes: selectedDuration,
            type: selectedType.id,
            completed_at: new Date().toISOString()
          });
          
          const result = await addPoints('meditation_complete');
          setPointsEarned(result.pointsEarned);
          setShowPoints(true);
        }
      });
    } else {
      setCurrentPhase('complete');
      setIsPlaying(false);
      
      await saveMutation.mutateAsync({
        duration_minutes: selectedDuration,
        type: selectedType.id,
        completed_at: new Date().toISOString()
      });
      
      const result = await addPoints('meditation_complete');
      setPointsEarned(result.pointsEarned);
      setShowPoints(true);
    }
  };
  
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);
  
  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = timeRemaining > 0 
    ? ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100 
    : 0;

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-1000',
      `bg-gradient-to-br ${selectedType.color.replace('from-', 'from-').replace('to-', 'via-white/30 to-')}`
    )}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meditation</h1>
          <p className="text-white/80">Find your inner peace</p>
        </div>
        
        {currentPhase === 'idle' ? (
          <>
            {/* Type Selection */}
            <div className="grid grid-cols-5 gap-2 mb-8">
              {MEDITATION_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType.id === type.id;
                return (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all',
                      isActive
                        ? 'bg-white text-slate-800 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{type.name}</span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Duration Selection */}
            <div className="flex justify-center gap-4 mb-8">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={cn(
                    'w-20 h-20 rounded-full font-bold text-xl transition-all',
                    selectedDuration === dur
                      ? 'bg-white text-slate-800 shadow-lg scale-110'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {dur}
                  <span className="text-xs block font-normal">min</span>
                </button>
              ))}
            </div>
            
            {/* Audio Toggle */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                  audioEnabled ? 'bg-white text-slate-800' : 'bg-white/20 text-white'
                )}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {audioEnabled ? 'Audio Guidance On' : 'Audio Off'}
                </span>
              </button>
            </div>
            
            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={startMeditation}
                size="lg"
                className="rounded-full px-12 py-8 text-xl bg-white text-slate-800 hover:bg-white/90 shadow-2xl"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                Begin
              </Button>
            </div>
          </>
        ) : (
          /* Active Meditation View */
          <div className="text-center">
            {/* Timer Circle */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-white/70 capitalize mt-2">{currentPhase}</span>
              </div>
            </div>
            
            {/* Current Instruction */}
            {currentPhase === 'main' && (
              <motion.p
                key={currentPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/90 text-lg mb-8 max-w-md mx-auto"
              >
                {isSpeaking ? 'Listen and follow along...' : 'Breathe deeply and relax...'}
              </motion.p>
            )}
            
            {currentPhase === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">Well Done! 🧘‍♀️</h2>
                <p className="text-white/80">You completed a {selectedDuration} minute meditation</p>
              </motion.div>
            )}
            
            {/* Controls */}
            <div className="flex justify-center gap-4">
              {currentPhase !== 'complete' ? (
                <>
                  <Button
                    onClick={isPlaying ? pauseMeditation : startMeditation}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white text-slate-800 hover:bg-white/90"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                  </Button>
                  <Button
                    onClick={resetMeditation}
                    size="lg"
                    variant="outline"
                    className="rounded-full w-16 h-16 border-white text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={resetMeditation}
                  size="lg"
                  className="rounded-full px-8 bg-white text-slate-800 hover:bg-white/90"
                >
                  Start New Session
                </Button>
              )}
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