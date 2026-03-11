import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, recipientName, message, tasks, events } = await req.json();

    if (!recipientEmail || !message) {
      return Response.json({ error: 'Recipient email and message are required' }, { status: 400 });
    }

    // Build email content
    let emailBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #334155;">Family Schedule Update</h2>
      <p>Hi ${recipientName || 'there'}! 👋</p>
      <p>${message}</p>`;

    if (tasks && tasks.length > 0) {
      emailBody += `<h3 style="color: #334155; margin-top: 20px;">📋 Your Tasks:</h3><ul style="list-style: none; padding: 0;">`;
      tasks.forEach(task => {
        emailBody += `<li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <strong>${task.title}</strong><br>
          <span style="color: #64748b; font-size: 14px;">Due: ${task.due_date}</span>
        </li>`;
      });
      emailBody += `</ul>`;
    }

    if (events && events.length > 0) {
      emailBody += `<h3 style="color: #334155; margin-top: 20px;">⭐ Upcoming Events:</h3><ul style="list-style: none; padding: 0;">`;
      events.forEach(event => {
        emailBody += `<li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          ${event.emoji || '⭐'} <strong>${event.title}</strong><br>
          <span style="color: #64748b; font-size: 14px;">${event.date}</span>
        </li>`;
      });
      emailBody += `</ul>`;
    }

    emailBody += `<p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      Sent with 💖 from Daily Essence
    </p></div>`;

    // Send email using Base44 Core integration
    await base44.integrations.Core.SendEmail({
      from_name: user.display_name || user.full_name || 'Daily Essence',
      to: recipientEmail,
      subject: '📅 Family Schedule Reminder',
      body: emailBody
    });

    return Response.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});