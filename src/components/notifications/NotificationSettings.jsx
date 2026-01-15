import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [notificationType, setNotificationType] = useState('browser');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setIsEnabled(u?.notification_enabled ?? true);
      setNotificationType(u?.notification_type ?? 'browser');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        notification_enabled: isEnabled,
        notification_type: notificationType,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <Bell className="w-5 h-5 text-purple-600" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <p className="text-sm text-slate-500">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-purple-600' : 'bg-slate-200'
            }`}
          >
            <motion.span
              layout
              className="inline-block h-6 w-6 transform rounded-full bg-white shadow"
              animate={{ x: isEnabled ? 28 : 4 }}
            />
          </button>
        </div>

        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Notification Type
              </label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="browser">Browser Notifications</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              ✨ We'll send you reminders for upcoming tasks, events, and special dates.
            </p>
          </motion.div>
        )}

        {!isEnabled && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-500 bg-amber-50 p-3 rounded-lg"
          >
            💡 Keeping notifications on helps you stay on top of your plans!
          </motion.p>
        )}

        <div className="mt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}