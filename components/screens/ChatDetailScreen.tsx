import React, { useState, useEffect, useRef } from 'react';
import { Event, User, Message } from '../../types';
import { useLanguage } from '../../lib/i18n';

interface ChatDetailScreenProps {
  event: Event;
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  event, currentUser, allUsers, messages, onSendMessage, onBack,
}) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by day for date separators
  const grouped: { day: string; msgs: Message[] }[] = [];
  messages.forEach(msg => {
    const day = formatDay(msg.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) {
      last.msgs.push(msg);
    } else {
      grouped.push({ day, msgs: [msg] });
    }
  });

  return (
    <div className="flex flex-col bg-white" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg, #7B4FFF30, #a855f730)' }}>
            {({'Sports':'⚽','Drinks':'🍹','Arts':'🎨','Study Sessions':'📚','Food':'🍜','Music':'🎵','Outdoors':'🌿','Other':'✨'} as Record<string,string>)[event.category] ?? '✨'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate text-sm">{event.title}</p>
          <p className="text-xs text-gray-400">{t.chat_members(event.attendeeIds.length)}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: '80px' }}>
        {grouped.map(({ day, msgs }) => (
          <div key={day}>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{day}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-3">
              {msgs.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const sender = allUsers.find(u => u.id === msg.senderId);
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <img
                        src={sender?.avatarUrl ?? `https://ui-avatars.com/api/?name=U&background=7B4FFF&color=fff`}
                        alt={sender?.name}
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                    )}
                    <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!isMe && sender && (
                        <span className="text-xs text-gray-400 ml-1">{sender.name}</span>
                      )}
                      <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mx-1">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">{t.chat_empty_detail}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length === 0 && (
        <div className="fixed bottom-[68px] left-0 right-0 max-w-lg mx-auto px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {[t.quick_1, t.quick_2, t.quick_3, t.quick_4].map(q => (
            <button key={q} onClick={() => onSendMessage(q)}
              className="flex-shrink-0 bg-primary/10 text-primary text-xs font-semibold px-3 py-2 rounded-full border border-primary/20">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chat_placeholder}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatDetailScreen;
