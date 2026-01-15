import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

const POINTS_CONFIG = {
  task_complete: 10,
  meditation_complete: 25,
  affirmation_listen: 5,
  beauty_routine: 15,
  meal_plan: 5,
  self_care: 30,
  streak_bonus: 20
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

const BADGES = {
  // Core Achievements
  first_task: { name: 'First Steps', icon: '🌱', description: 'Complete your first task', category: 'tasks' },
  ten_tasks: { name: 'Task Master', icon: '⭐', description: 'Complete 10 tasks', category: 'tasks' },
  fifty_tasks: { name: 'Productivity Queen', icon: '👑', description: 'Complete 50 tasks', category: 'tasks' },
  hundred_tasks: { name: 'Boss Mom', icon: '💎', description: 'Complete 100 tasks', category: 'tasks' },
  
  // Planning Achievements
  planning_pro: { name: 'Planning Pro', icon: '📋', description: 'Plan 7 days in a row', category: 'planning' },
  meal_planner: { name: 'Meal Planner', icon: '🍳', description: 'Plan 20 meals', category: 'planning' },
  organized_queen: { name: 'Organized Queen', icon: '📚', description: 'Create 10 notes', category: 'planning' },
  
  // Wellness Achievements
  first_meditation: { name: 'Inner Peace', icon: '🧘', description: 'Complete your first meditation', category: 'wellness' },
  zen_master: { name: 'Zen Master', icon: '☯️', description: 'Meditate for 100 minutes total', category: 'wellness' },
  beauty_starter: { name: 'Glow Getter', icon: '💄', description: 'Complete 10 beauty routines', category: 'wellness' },
  beauty_master: { name: 'Glow Up', icon: '✨', description: 'Complete 30 beauty routines', category: 'wellness' },
  self_care_starter: { name: 'Me Time', icon: '🛁', description: 'Complete 3 self-care activities', category: 'wellness' },
  self_care_pro: { name: 'Self Love', icon: '💖', description: 'Complete 10 self-care activities', category: 'wellness' },
  
  // Streak Achievements
  three_day_streak: { name: 'Getting Started', icon: '🔥', description: '3 day streak', category: 'streaks' },
  week_streak: { name: 'Consistency', icon: '🔥', description: '7 day streak', category: 'streaks' },
  month_streak: { name: 'Unstoppable', icon: '💫', description: '30 day streak', category: 'streaks' },
  
  // Level Achievements
  level_5: { name: 'Rising Star', icon: '🌟', description: 'Reach level 5', category: 'levels' },
  level_10: { name: 'Superwoman', icon: '💪', description: 'Reach level 10', category: 'levels' },
  level_20: { name: 'Legend', icon: '🏆', description: 'Reach level 20', category: 'levels' },
  
  // Special Achievements
  early_bird: { name: 'Early Bird', icon: '🐦', description: 'Complete a task before 7am', category: 'special' },
  night_owl: { name: 'Night Owl', icon: '🦉', description: 'Complete a task after 10pm', category: 'special' },
  perfect_day: { name: 'Perfect Day', icon: '🌈', description: 'Complete all tasks in a day', category: 'special' },
};

export function triggerCelebration(intensity = 'medium') {
  const configs = {
    small: { particleCount: 30, spread: 50 },
    medium: { particleCount: 100, spread: 70, origin: { y: 0.6 } },
    large: { 
      particleCount: 200, 
      spread: 100, 
      origin: { y: 0.5 },
      colors: ['#f472b6', '#fb7185', '#fbbf24', '#a78bfa', '#60a5fa']
    }
  };
  confetti(configs[intensity] || configs.medium);
}

export function useGamification() {
  const queryClient = useQueryClient();
  
  const { data: progressList = [] } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => base44.entities.UserProgress.list(),
  });
  
  const progress = progressList[0] || {
    points: 0,
    level: 1,
    total_tasks_completed: 0,
    streak_days: 0,
    badges: []
  };
  
  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProgress'] }),
  });
  
  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProgress'] }),
  });
  
  const calculateLevel = (points) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  };
  
  const getProgressToNextLevel = () => {
    const currentLevel = progress.level || 1;
    const currentPoints = progress.points || 0;
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const pointsInLevel = currentPoints - currentThreshold;
    const pointsNeeded = nextThreshold - currentThreshold;
    return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
  };
  
  const addPoints = async (action, customPoints = null) => {
    const pointsToAdd = customPoints || POINTS_CONFIG[action] || 10;
    const newPoints = (progress.points || 0) + pointsToAdd;
    const newLevel = calculateLevel(newPoints);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let newTasks = progress.total_tasks_completed || 0;
    if (action === 'task_complete') newTasks += 1;
    
    // Check for level up
    const leveledUp = newLevel > (progress.level || 1);
    
    // Check for new badges
    const currentBadges = progress.badges || [];
    const newBadges = [...currentBadges];
    
    if (newTasks === 1 && !currentBadges.includes('first_task')) newBadges.push('first_task');
    if (newTasks >= 10 && !currentBadges.includes('ten_tasks')) newBadges.push('ten_tasks');
    if (newTasks >= 50 && !currentBadges.includes('fifty_tasks')) newBadges.push('fifty_tasks');
    if (action === 'meditation_complete' && !currentBadges.includes('first_meditation')) newBadges.push('first_meditation');
    if (newLevel >= 5 && !currentBadges.includes('level_5')) newBadges.push('level_5');
    if (newLevel >= 10 && !currentBadges.includes('level_10')) newBadges.push('level_10');
    
    const earnedNewBadge = newBadges.length > currentBadges.length;
    
    const updateData = {
      points: newPoints,
      level: newLevel,
      total_tasks_completed: newTasks,
      last_activity_date: today,
      badges: newBadges
    };
    
    if (progress.id) {
      await updateProgressMutation.mutateAsync({ id: progress.id, data: updateData });
    } else {
      await createProgressMutation.mutateAsync(updateData);
    }
    
    // Trigger celebrations
    if (leveledUp) {
      triggerCelebration('large');
    } else if (earnedNewBadge) {
      triggerCelebration('medium');
    } else {
      triggerCelebration('small');
    }
    
    return { pointsEarned: pointsToAdd, leveledUp, earnedNewBadge };
  };
  
  return {
    progress,
    addPoints,
    getProgressToNextLevel,
    BADGES,
    LEVEL_THRESHOLDS
  };
}

export { BADGES, POINTS_CONFIG };