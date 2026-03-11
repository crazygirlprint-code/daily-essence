import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate } = await req.json();

    // Fetch tasks and events
    const tasks = await base44.entities.Task.filter({
      due_date: { $gte: startDate, $lte: endDate }
    });

    const events = await base44.entities.SpecialEvent.filter({
      date: { $gte: startDate, $lte: endDate }
    });

    const familyMembers = await base44.entities.FamilyMember.list();

    // Create PDF
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Family Calendar', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`${startDate} to ${endDate}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 36);

    let y = 50;

    // Family Members Section
    if (familyMembers.length > 0) {
      doc.setFontSize(14);
      doc.text('Family Members', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      familyMembers.forEach(member => {
        doc.text(`• ${member.name} (${member.relationship})`, 25, y);
        y += 6;
      });
      y += 5;
    }

    // Events Section
    if (events.length > 0) {
      doc.setFontSize(14);
      doc.text('Special Events', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      events.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${event.emoji || '⭐'} ${event.title} - ${event.date}`, 25, y);
        y += 6;
      });
      y += 5;
    }

    // Tasks Section
    if (tasks.length > 0) {
      doc.setFontSize(14);
      doc.text('Tasks', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      tasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).forEach(task => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const status = task.completed ? '✓' : '○';
        const member = task.family_member ? ` (${task.family_member})` : '';
        doc.text(`${status} ${task.title}${member} - ${task.due_date}`, 25, y);
        y += 6;
      });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=family-calendar.pdf'
      }
    });
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});