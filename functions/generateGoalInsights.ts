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
- Self-care activities: ${activities.length} activities logged
- Meals planned: ${meals.length} meals

Based on this data, provide:
1. A brief assessment of progress toward this wellness goal (1-2 sentences)
2. One specific recommendation for improving progress
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