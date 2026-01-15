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
      utterance.rate = options.rate || 0.85;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1;
      
      // Prioritize natural, premium voices (Apple, Google Neural, Microsoft Natural)
      const voices = window.speechSynthesis.getVoices();
      
      // Priority list for most natural-sounding voices
      const preferredVoices = [
        'Samantha',           // macOS - very natural
        'Ava',                // macOS - premium
        'Allison',            // macOS Enhanced
        'Serena',             // macOS Enhanced  
        'Google US English',  // Android neural
        'Google UK English Female',
        'Microsoft Aria',     // Windows 11 Neural
        'Microsoft Jenny',    // Windows Neural
        'Alex',               // macOS default male (good quality)
      ];
      
      let selectedVoice = null;
      
      // First, try to find a preferred voice
      for (const preferred of preferredVoices) {
        selectedVoice = voices.find(v => v.name.includes(preferred));
        if (selectedVoice) break;
      }
      
      // Fallback to any natural-sounding English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural')))
        ) || voices.find(v => v.lang.startsWith('en-'));
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
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