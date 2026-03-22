import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a shareable token
    const shareToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    // Save share token to user data
    await base44.auth.updateMe({
      calendar_share_token: shareToken,
      calendar_share_expires: expiresAt.toISOString()
    });

    // Get app URL
    const appUrl = req.headers.get('origin') || 'https://your-app.com';
    const shareUrl = `${appUrl}/SharedCalendar?token=${shareToken}`;

    return Response.json({ 
      shareUrl,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error generating shareable calendar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});