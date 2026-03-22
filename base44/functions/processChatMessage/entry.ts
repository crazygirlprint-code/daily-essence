import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    
    const { message, media_files, session_id } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const chatMessage = await base44.entities.ChatMessage.create({
      user_name: user ? user.full_name : 'Guest',
      user_email: user ? user.email : null,
      message,
      media_files: media_files || [],
      session_id: session_id || crypto.randomUUID(),
      status: 'pending'
    });

    // Update status to processing
    await base44.entities.ChatMessage.update(chatMessage.id, {
      status: 'processing'
    });

    // Here you can add your custom processing logic
    // For example: AI analysis, content moderation, etc.

    // Mark as completed
    await base44.entities.ChatMessage.update(chatMessage.id, {
      status: 'completed'
    });

    return Response.json({
      success: true,
      message_id: chatMessage.id,
      session_id: chatMessage.session_id
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});