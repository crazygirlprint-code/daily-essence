import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emojis = [
  // Celebrations
  '🎁', '🎂', '🎉', '🎊', '🎈', '🎀', '🎆', '🎇',
  // Love & Hearts
  '❤️', '💕', '💖', '💗', '💝', '💘', '💞', '💓',
  // Stars & Sparkles
  '⭐', '✨', '🌟', '💫', '🌠', '✨', '⚡', '🔥',
  // Happy Faces
  '😊', '😍', '🥰', '😘', '😄', '😆', '😉', '😁',
  // Love Faces
  '😻', '🥳', '🤗', '😇', '😂', '🎊', '🌈', '☀️',
  // Holidays
  '🎄', '🎃', '🧧', '🎎', '🎍', '🎋', '🧨', '🪔',
  // Flowers
  '🌹', '🌺', '🌸', '🌼', '🌻', '🌷', '🌿', '🍀',
  // Music
  '🎵', '🎶', '🎸', '🎹', '🎤', '🎧', '🎼', '🎺',
  // Cake & Treats
  '🍰', '🧁', '🍪', '🍩', '🍫', '🍬', '🍭', '🥂',
  // Animals
  '🐱', '🐶', '🐰', '🦋', '🐝', '🦜', '🐢', '🦁',
  // Nature
  '🌙', '⛅', '🌤️', '🌻', '🌊', '🌋', '🏔️', '🌴',
  // Hand Gestures
  '👏', '🙌', '👋', '✌️', '🤞', '❤️', '🤝', '👐',
];


export default function EmojiPicker({ value, onChange, isPremium }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isPremium) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="rounded-lg text-xs"
          title="Premium feature"
        >
          <Smile className="w-4 h-4 mr-1" />
          Add Emoji
        </Button>
        <span className="absolute -top-8 right-0 text-xs bg-gradient-to-r from-purple-600 to-rose-600 text-white px-2 py-1 rounded whitespace-nowrap">
          Premium only
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all text-sm"
      >
        {value ? <span className="text-lg">{value}</span> : <Smile className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3"
          >
            <div className="grid grid-cols-6 gap-2 w-64">
              {emojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                  }}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    value === emoji
                      ? 'bg-purple-100 ring-2 ring-purple-400'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}