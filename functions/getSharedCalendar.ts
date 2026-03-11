import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Find user with this share token
    const users = await base44.asServiceRole.entities.User.filter({
      calendar_share_token: token
    });

    if (users.length === 0) {
      return Response.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    const owner = users[0];

    // Check if token is expired
    if (owner.calendar_share_expires && new Date(owner.calendar_share_expires) < new Date()) {
      return Response.json({ error: 'Link has expired' }, { status: 401 });
    }

    // Get tasks and events for this user
    const tasks = await base44.asServiceRole.entities.Task.filter({
      created_by: owner.email
    });

    const events = await base44.asServiceRole.entities.SpecialEvent.filter({
      created_by: owner.email
    });

    const familyMembers = await base44.asServiceRole.entities.FamilyMember.filter({
      created_by: owner.email
    });

    return Response.json({
      ownerName: owner.display_name || owner.full_name,
      tasks: tasks.filter(t => !t.completed), // Only show incomplete tasks
      events,
      familyMembers
    });
  } catch (error) {
    console.error('Error fetching shared calendar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});