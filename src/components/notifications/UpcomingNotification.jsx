import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Calendar, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UpcomingNotification() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.notification_enabled) {
        checkUpcomingItems();
        // Check every 4 hours
        const interval = setInterval(checkUpcomingItems, 4 * 60 * 60 * 1000);
        return () => clearInterval(interval);
      }
    }).catch(() => {});
  }, []);

  const checkUpcomingItems = async () => {
    try {
      // Check if we showed notifications recently (within 4 hours)
      const lastShown = localStorage.getItem('lastNotificationTime');
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      
      if (lastShown && (now - parseInt(lastShown)) < fourHours) {
        return; // Don't show notifications yet
      }

      const response = await base44.functions.invoke('checkUpcomingItems');
      const { upcomingItems } = response.data;

      if (upcomingItems.tasks.length > 0 || upcomingItems.events.length > 0) {
        const newNotifications = [];

        if (upcomingItems.tasks.length > 0) {
          newNotifications.push({
            id: 'tasks',
            type: 'task',
            count: upcomingItems.tasks.length,
            items: upcomingItems.tasks,
            message: `You have ${upcomingItems.tasks.length} task${upcomingItems.tasks.length > 1 ? 's' : ''} due today/tomorrow`,
          });
        }

        if (upcomingItems.events.length > 0) {
          newNotifications.push({
            id: 'events',
            type: 'event',
            count: upcomingItems.events.length,
            items: upcomingItems.events,
            message: `${upcomingItems.events.length} special event${upcomingItems.events.length > 1 ? 's' : ''} coming up`,
          });
        }

        setNotifications(newNotifications);
        localStorage.setItem('lastNotificationTime', now.toString());

        // Send browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          newNotifications.forEach(notif => {
            new Notification('Daily Essence', {
              body: notif.message,
              icon: '🔔',
              tag: notif.id,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error checking upcoming items:', error);
    }
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm space-y-3">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`rounded-xl p-4 shadow-lg border-l-4 ${
              notification.type === 'task'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-purple-50 border-purple-500'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {notification.type === 'task' ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {notification.items.slice(0, 2).map((item) => item.title).join(', ')}
                    {notification.items.length > 2 && ` +${notification.items.length - 2} more`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}