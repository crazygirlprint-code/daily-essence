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
import { useTheme } from '@/components/hooks/useTheme';

const MEDITATION_TYPES = [
  { id: 'breathing', name: 'Breathing', icon: Wind, color: 'from-purple-200 to-purple-300', colorLuxury: 'from-purple-300 to-purple-400' },
  { id: 'body_scan', name: 'Body Scan', icon: Heart, color: 'from-purple-200 to-purple-300', colorLuxury: 'from-purple-300 to-purple-400' },
  { id: 'gratitude', name: 'Gratitude', icon: CloudSun, color: 'from-purple-200 to-purple-300', colorLuxury: 'from-purple-300 to-purple-400' },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'from-purple-200 to-purple-300', colorLuxury: 'from-purple-300 to-purple-400' },
  { id: 'stress_relief', name: 'Stress Relief', icon: Leaf, color: 'from-purple-200 to-purple-300', colorLuxury: 'from-purple-300 to-purple-400' },
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
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const audioRef = useRef(null);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { addPoints } = useGamification();
  const { theme } = useTheme();
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
    
    // Start background music
    if (musicEnabled && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(err => console.log('Audio autoplay prevented'));
    }
    
    if (audioEnabled) {
      speak(script.intro, {
        rate: 0.82,
        pitch: 1.05,
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
          rate: 0.8,
          pitch: 1.05,
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
    if (audioRef.current) audioRef.current.pause();
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
  };
  
  const resetMeditation = () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    setCurrentPhase('idle');
    stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
  };
  
  const completeMeditation = async () => {
    setCurrentPhase('closing');
    
    if (audioEnabled) {
      speak(script.closing, {
        rate: 0.82,
        pitch: 1.05,
        onEnd: async () => {
          setCurrentPhase('complete');
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
          
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
      if (audioRef.current) audioRef.current.pause();
      
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

  const meditationColor = theme === 'dark-luxury' ? selectedType.colorLuxury : selectedType.color;

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-1000 relative overflow-hidden',
      `bg-gradient-to-br ${meditationColor}`
    )}>
      {/* Ambient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
      
      {/* Background meditation music - royalty free ambient */}
      <audio 
        ref={audioRef} 
        loop
        src="https://cdn.pixabay.com/audio/2022/05/13/audio_1808fbf07a.mp3"
      />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-white mb-2 drop-shadow-lg">Meditation</h1>
          <p className="text-white/90">Find your inner peace</p>
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
                      'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all backdrop-blur-sm',
                      isActive
                        ? 'bg-white/95 text-slate-800 shadow-xl ring-2 ring-white/50'
                        : 'bg-white/15 text-white hover:bg-white/25'
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
                    'w-20 h-20 rounded-full font-bold text-xl transition-all backdrop-blur-sm',
                    selectedDuration === dur
                      ? 'bg-white/95 text-slate-800 shadow-xl scale-110 ring-2 ring-white/50'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  )}
                >
                  {dur}
                  <span className="text-xs block font-normal">min</span>
                </button>
              ))}
            </div>
            
            {/* Audio Toggles */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all backdrop-blur-sm',
                  audioEnabled ? 'bg-white/95 text-slate-800 shadow-lg' : 'bg-white/15 text-white'
                )}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-sm font-medium">
                  {audioEnabled ? 'Guidance' : 'Silent'}
                </span>
              </button>
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-all backdrop-blur-sm',
                  musicEnabled ? 'bg-white/95 text-slate-800 shadow-lg' : 'bg-white/15 text-white'
                )}
              >
                <span className="text-sm font-medium">
                  {musicEnabled ? '🎵 Music' : '🔇 No Music'}
                </span>
              </button>
            </div>
            
            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                onClick={startMeditation}
                size="lg"
                className="rounded-full px-12 py-8 text-xl bg-white/95 text-slate-800 hover:bg-white shadow-2xl backdrop-blur-sm"
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
              <div className="absolute inset-0 bg-white/5 rounded-full backdrop-blur-md" />
              <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
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
                  className="drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-5xl font-bold text-white drop-shadow-lg">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-white/80 capitalize mt-2 text-sm tracking-wider">{currentPhase}</span>
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
                    className="rounded-full w-16 h-16 bg-white/95 text-slate-800 hover:bg-white shadow-xl backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                  </Button>
                  <Button
                    onClick={resetMeditation}
                    size="lg"
                    variant="outline"
                    className="rounded-full w-16 h-16 border-2 border-white/80 text-white hover:bg-white/15 backdrop-blur-sm"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={resetMeditation}
                  size="lg"
                  className="rounded-full px-8 bg-white/95 text-slate-800 hover:bg-white shadow-xl backdrop-blur-sm"
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