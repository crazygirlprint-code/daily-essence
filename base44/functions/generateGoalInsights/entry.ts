import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's wellness goals and recent activities
    const goals = await base44.entities.WellnessGoal.filter({
      created_by: user.email,
      active: true
    });

    if (goals.length === 0) {
      return Response.json({ insights: [] });
    }

    // Fetch related data
    const tasks = await base44.entities.Task.filter({ created_by: user.email });
    const meditations = await base44.entities.MeditationSession.filter({ created_by: user.email });
    const selfCareActivities = await base44.entities.SelfCareActivity.filter({ created_by: user.email });
    const meals = await base44.entities.MealPlan.filter({ created_by: user.email });
    const trackedActivities = await base44.entities.Activity.filter({ created_by: user.email });

    // Generate insights for each goal using LLM
    const insights = [];

    for (const goal of goals) {
      // Prepare context data for the LLM
      const lastWeekTasks = tasks.filter(t => {
        const createdDate = new Date(t.created_date);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate > weekAgo;
      });

      const completedTasks = lastWeekTasks.filter(t => t.completed);
      const completionRate = lastWeekTasks.length > 0 ? (completedTasks.length / lastWeekTasks.length) * 100 : 0;

      const recentMeditations = meditations.filter(m => {
        const sessionDate = new Date(m.completed_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate > weekAgo;
      });

      const recentTrackedActivities = trackedActivities.filter(a => {
        const actDate = new Date(a.activity_date);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return actDate > weekAgo;
      });

      const activitySummary = recentTrackedActivities.reduce((acc, a) => {
        const prev = acc[a.type] || { count: 0, totalTime: 0, avgMood: 0 };
        const moodScore = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };
        return {
          ...acc,
          [a.type]: {
            count: prev.count + 1,
            totalTime: prev.totalTime + (a.duration_minutes || 0),
            avgMood: prev.avgMood + (moodScore[a.mood_after] || 0),
          },
        };
      }, {});

      const activityDetails = Object.entries(activitySummary).map(([type, data]) => {
        const avgMood = Math.round(data.avgMood / data.count);
        return `${type}: ${data.count} times (${data.totalTime} min total, avg mood: ${avgMood}/5)`;
      }).join('\n');

      const prompt = `
You are a wellness coach analyzing a user's progress toward their goal: "${goal.name}"

Goal Details:
- Category: ${goal.category}
- Description: ${goal.description}
- Current Progress: ${goal.current_progress}%
- Priority: ${goal.priority}

User Activity (Last 7 days):
- Tasks completed: ${completedTasks.length} out of ${lastWeekTasks.length} (${Math.round(completionRate)}% completion)
- Meditation sessions: ${recentMeditations.length} sessions totaling ${recentMeditations.reduce((sum, m) => sum + m.duration_minutes, 0)} minutes
- Self-care activities: ${selfCareActivities.length} activities logged

Daily Tracked Activities:
${activityDetails || 'None logged yet'}

Based on this comprehensive activity data, provide:
1. A brief assessment of progress toward this wellness goal (1-2 sentences)
2. One specific recommendation for improving progress based on their activity patterns
3. A suggestion to adjust daily routine to better support this goal

Keep the response concise and actionable.`;

      const insightResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      insights.push({
        goal_id: goal.id,
        goal_name: goal.name,
        insight: insightResponse,
      });
    }

    return Response.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});