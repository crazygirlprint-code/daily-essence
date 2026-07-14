import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export function usePremiumCheck(requiredTier = 'Flourish') {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState(null);

  // Tier hierarchy
  const tierLevels = {
    'Seedling': 0,
    'seedling': 0,
    'Nurturer': 1,
    'nurturer': 1,
    'Flourish': 2,
    'flourish': 2,
    'Radiant': 3,
    'radiant': 3
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(true);
      return;
    }

    // Admin always has access
    if (user.role === 'admin') {
      setHasAccess(true);
      setUserTier('admin');
      setIsLoading(false);
      return;
    }

    // Check subscription status
    const isActive = user.subscription_status === 'active';
    const currentTier = user.subscription_plan || 'Seedling';

    setUserTier(currentTier);

    // Check if user's tier meets the requirement
    const requiredLevel = tierLevels[requiredTier] || 0;
    const currentLevel = tierLevels[currentTier] || 0;

    setHasAccess(isActive && currentLevel >= requiredLevel);
    setIsLoading(false);
  }, [user, requiredTier]);

  return { hasAccess, isLoading, userTier };
}