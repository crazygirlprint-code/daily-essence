import React from 'react';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ChatDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-stone-900 dark:text-rose-100 mb-2">
            Chat Widget Demo
          </h1>
          <p className="text-stone-600 dark:text-rose-200">
            Test the embedded chat interface with media upload capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Embedded Version */}
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-stone-200 dark:border-rose-500/40">
            <h2 className="text-xl font-serif text-stone-900 dark:text-rose-100 mb-4">
              Embedded Chat
            </h2>
            <div className="h-[600px] border border-stone-300 dark:border-rose-500/40 rounded-xl overflow-hidden">
              <ChatWidget isEmbedded={true} />
            </div>
          </div>

          {/* Integration Instructions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-stone-200 dark:border-rose-500/40">
              <h2 className="text-xl font-serif text-stone-900 dark:text-rose-100 mb-4">
                Floating Widget
              </h2>
              <p className="text-sm text-stone-600 dark:text-rose-200 mb-4">
                Click the chat button in the bottom-right corner to see the floating widget in action.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-stone-200 dark:border-rose-500/40">
              <h2 className="text-xl font-serif text-stone-900 dark:text-rose-100 mb-4">
                Embed Code
              </h2>
              <p className="text-sm text-stone-600 dark:text-rose-200 mb-3">
                To embed this chat on any website:
              </p>
              <div className="bg-stone-100 dark:bg-slate-950/50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-stone-700 dark:text-rose-100 font-mono">
{`<iframe 
  src="https://your-domain.com/ChatDemo"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 16px;"
></iframe>`}
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-stone-200 dark:border-rose-500/40">
              <h2 className="text-xl font-serif text-stone-900 dark:text-rose-100 mb-4">
                Features
              </h2>
              <ul className="space-y-2 text-sm text-stone-600 dark:text-rose-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Custom branded interface</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Image and video uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Real-time message storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Guest and authenticated users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Session-based conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-rose-400 mt-0.5">✓</span>
                  <span>Mobile responsive</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Widget */}
        <ChatWidget />
      </div>
    </div>
  );
}