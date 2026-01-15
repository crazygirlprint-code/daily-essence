import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Show banner if notifications are disabled
      if (u && !u.notification_enabled) {
        setShowBanner(true);
      }
    }).catch(() => {});
  }, []);

  const handleEnableNotifications = async () => {
    try {
      await base44.auth.updateMe({ notification_enabled: true });
      setShowBanner(false);
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-500 to-rose-500 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            <div className="flex-1">
              <p className="font-medium">Notifications are off</p>
              <p className="text-sm opacity-90">
                Turn them back on to stay updated on tasks, events, and plans!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="bg-white text-purple-600 hover:bg-white/90 font-medium rounded-lg"
            >
              Turn On
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}