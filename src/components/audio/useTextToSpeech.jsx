import { useState, useCallback, useRef } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  
  const speak = useCallback((text, options = {}) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 0.95;
      utterance.volume = options.volume || 1;
      
      // Try to get a natural, soothing voice (prioritize premium voices)
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Ava') ||
        v.name.includes('Allison') ||
        v.name.includes('Serena') ||
        v.name.includes('Fiona') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Microsoft Zira') ||
        (v.lang.startsWith('en') && v.name.includes('Natural'))
      ) || voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
      
      if (naturalVoice) utterance.voice = naturalVoice;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        options.onEnd?.();
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  const pause = useCallback(() => {
    if ('speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);
  
  const resume = useCallback(() => {
    if ('speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);
  
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);
  
  return { speak, pause, resume, stop, isSpeaking, isPaused };
}