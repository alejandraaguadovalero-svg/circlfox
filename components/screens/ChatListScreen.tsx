import React, { useState } from 'react';
import { Event, User, Message } from '../../types';

interface ChatListScreenProps {
  events: Event[];
  currentUser: User;
  eventMessages: Record<string, Message[]>;
  onSelectChat: (eventId: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const Header: React.FC = () => (
  <header className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
    <h1 className="text-xl font-bold text-secondary">Messages</h1>
  </header>
);

const ChatListScreen: React.FC<ChatListScreenProps> = ({ events, currentUser, eventMessages, onSelectChat }) => {
  const [search, setSearch] = useState('');

  // Only show events the current user has joined
  const joinedEvents = events.filter(e => e.attendeeIds.includes(currentUser.id));

  const filtered = joinedEvents.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-4 py-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.map(event => {
          const msgs = eventMessages[event.id] ?? [];
          const lastMsg = msgs[msgs.length - 1];
          const lastSender = lastMsg
            ? event.organizer.id === lastMsg.senderId
              ? event.organizer.name
              : `User ${lastMsg.senderId}`
            : null;
          const preview = lastMsg
            ? `${lastMsg.senderId === currentUser.id ? 'You' : lastSender}: ${lastMsg.text}`
            : 'No messages yet — say hi! 👋';

          return (
            <div
              key={event.id}
              onClick={() => onSelectChat(event.id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50"
            >
              <div className="relative flex-shrink-0">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-14 h-14 rounded-2xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, #7B4FFF20, #a855f720)' }}>
                    {({'Sports':'⚽','Drinks':'🍹','Arts':'🎨','Study Sessions':'📚','Food':'🍜','Music':'🎵','Outdoors':'🌿','Other':'✨'} as Record<string,string>)[event.category] ?? '✨'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">{event.attendeeIds.length}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                  {lastMsg && (
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{timeAgo(lastMsg.timestamp)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{preview}</p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 px-6">
            <p className="text-gray-400 text-sm">
              {search ? 'No chats match your search.' : 'Join an event to start chatting with attendees.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListScreen;
