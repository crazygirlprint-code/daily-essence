import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a07709bbde7ffce12991229';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: 'Google API error', details: errText }, { status: 502 });
    }

    const data = await res.json();
    const events = data.items || [];

    const existing = await base44.entities.SpecialEvent.filter({});
    const existingGoogleIds = new Set(
      existing.filter(e => e.google_event_id).map(e => e.google_event_id)
    );

    let syncedCount = 0;
    for (const event of events) {
      if (existingGoogleIds.has(event.id)) continue;
      if (!event.start) continue;

      const eventDate = event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null);
      if (!eventDate) continue;

      await base44.entities.SpecialEvent.create({
        title: event.summary || 'Untitled Event',
        date: eventDate,
        type: 'appointment',
        notes: event.description || '',
        emoji: '📅',
        google_event_id: event.id
      });
      syncedCount++;
    }

    return Response.json({ synced: syncedCount, total: events.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});