import React, { useState } from 'react';
import { Event, User, Category } from '../types';
import { UsersIcon } from './icons';

const CATEGORY_EMOJIS: Record<string, string> = {
  Sports: '⚽', Drinks: '🍹', Arts: '🎨', 'Study Sessions': '📚',
  Food: '🍜', Music: '🎵', Outdoors: '🌿', Other: '✨',
};

interface EventCardProps {
  event: Event;
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const EventCard: React.FC<EventCardProps> = ({ event, currentUser, onSelectEvent, onJoin, onLeave }) => {
  const isOrganizer = event.organizer.id === currentUser.id;
  const isAttending = event.attendeeIds.includes(currentUser.id);
  const joinerIds = event.attendeeIds.filter(id => id !== event.organizer.id);
  const isFull = joinerIds.length >= event.maxParticipants;
  const [showMenu, setShowMenu] = useState(false);

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    isAttending ? onLeave(event.id) : onJoin(event.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    alert('Event reported. Thanks for keeping Circl safe!');
  };

  return (
    <div className="bg-white mb-4">
      <div className="p-4 flex items-center gap-3">
        <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold text-sm text-secondary">
            {event.organizer.name} <span className="font-normal text-gray-500">Created an Event</span>
          </p>
          <p className="text-xs text-gray-400">{timeAgo(event.date)}</p>
        </div>
        <div className="ml-auto relative">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
            className="text-gray-500 text-lg leading-none px-2"
          >
            ···
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-lg border border-gray-100 w-36 py-1">
                <button onClick={handleShare} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  Share event
                </button>
                <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50">
                  Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cursor-pointer" onClick={() => onSelectEvent(event.id)}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-7xl">{CATEGORY_EMOJIS[event.category] ?? '✨'}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-secondary">{event.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{event.description.length > 100 ? event.description.substring(0, 100) + '…' : event.description}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                {joinerIds.length} / {event.maxParticipants}
              </p>
            </div>
          </div>
          {isOrganizer ? (
            <span className="font-semibold py-2 px-4 rounded-lg text-sm bg-gray-100 text-gray-500">Your event</span>
          ) : (
            <button
              onClick={handleJoinLeave}
              disabled={!isAttending && isFull}
              className={`font-semibold py-2 px-4 rounded-lg text-sm transition-colors ${
                isAttending
                  ? 'bg-gray-200 text-gray-700'
                  : isFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isAttending ? 'Joined' : isFull ? 'Full' : 'Join Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
