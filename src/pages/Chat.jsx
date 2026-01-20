import React, { useState } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ChatPage() {
  const [sessionId, setSessionId] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full shadow-2xl overflow-hidden">
        <ChatWidget 
          sessionId={sessionId} 
          onSessionUpdate={setSessionId}
        />
      </div>
    </div>
  );
}