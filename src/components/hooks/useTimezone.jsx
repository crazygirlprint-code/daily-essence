import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useTimezone() {
  useEffect(() => {
    const initializeTimezone = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        // If user already has timezone, skip
        if (user.timezone) return;

        // Detect user's timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Save timezone to user profile
        if (detectedTimezone) {
          await base44.auth.updateMe({ timezone: detectedTimezone });
        }
      } catch (error) {
        console.error('Failed to initialize timezone:', error);
      }
    };

    initializeTimezone();
  }, []);
}