import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if notifications are enabled
    if (!user.notification_enabled) {
      return Response.json({ message: 'Notifications disabled for user' });
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get upcoming tasks (today and tomorrow)
    const tasks = await base44.asServiceRole.entities.Task.filter({
      created_by: user.email,
      completed: false,
      due_date: { $in: [todayStr, tomorrowStr] }
    });

    // Get upcoming events (today and tomorrow)
    const events = await base44.asServiceRole.entities.SpecialEvent.filter({
      created_by: user.email,
      date: { $in: [todayStr, tomorrowStr] }
    });

    const upcomingItems = {
      tasks: tasks.filter(t => !t.completed),
      events: events
    };

    return Response.json({
      success: true,
      upcomingItems,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking upcoming items:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});