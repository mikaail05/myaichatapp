'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      <div className="text-center py-3 border-b border-gray-700 font-medium text-lg">
        AI Chat Bot
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[70%] px-4 py-2 rounded-xl ${
              m.role === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-700 text-white mr-auto'
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 flex items-center px-4 py-3 gap-2 z-10 mb-6 bg-black"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Message"
          className="flex-1 p-3 rounded-full bg-zinc-800 text-white border border-zinc-600 outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium"
        >
          Send
        </button>
      </form>
    </main>
  );
}