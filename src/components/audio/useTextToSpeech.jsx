import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef(null);
  
  // Wait for voices to load
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);
  
  const getBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    
    // Comprehensive list of high-quality voices in priority order
    const preferredVoices = [
      // iOS/macOS Premium (Best quality)
      { name: 'Samantha (Enhanced)', exact: false },
      { name: 'Samantha', exact: false },
      { name: 'Ava (Enhanced)', exact: false },
      { name: 'Ava', exact: false },
      
      // Google Neural (Very natural on Android/Chrome)
      { name: 'Google US English', exact: false },
      { name: 'Google UK English Female', exact: false },
      { name: 'en-US-Neural2', exact: false },
      
      // Microsoft Neural (Windows 11)
      { name: 'Microsoft Aria Online', exact: false },
      { name: 'Microsoft Jenny Online', exact: false },
      { name: 'Microsoft Aria', exact: false },
      
      // macOS Enhanced voices
      { name: 'Allison', exact: false },
      { name: 'Nicky', exact: false },
      { name: 'Susan', exact: false },
      
      // Fallback quality voices
      { name: 'Alex', exact: false },
      { name: 'Fiona', exact: false },
    ];
    
    // Try preferred voices
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred.name));
      if (voice) return voice;
    }
    
    // Try any voice marked as premium/enhanced/neural
    const premiumVoice = voices.find(v => 
      v.name.match(/enhanced|premium|neural|natural/i) && v.lang.startsWith('en')
    );
    if (premiumVoice) return premiumVoice;
    
    // Last resort: any English female voice
    return voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) || voices[0];
  }, []);
  
  const speak = useCallback((text, options = {}) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optimized settings for natural speech
      utterance.rate = options.rate || 0.88;  // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.05; // Slightly higher for warmth
      utterance.volume = options.volume || 1;
      
      const selectedVoice = getBestVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      }
      
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