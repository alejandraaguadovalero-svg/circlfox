import React, { useState } from 'react';
import { Event, User } from '../types';

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

const EventCard: React.FC<EventCardProps> = ({ event, currentUser, onSelectEvent, onJoin, onLeave }) => {
  const isOrganizer = event.organizer.id === currentUser.id;
  const isAttending = event.attendeeIds.includes(currentUser.id);
  const joinerIds = event.attendeeIds.filter(id => id !== event.organizer.id);
  const spotsLeft = event.maxParticipants - joinerIds.length;
  const isFull = spotsLeft <= 0;
  const isTonight = new Date(event.date).toDateString() === new Date().toDateString();
  const [showMenu, setShowMenu] = useState(false);

  const eventDate = new Date(event.date);
  const timeStr = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dateStr = isTonight ? `Tonight · ${timeStr}` : eventDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ` · ${timeStr}`;

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    isAttending ? onLeave(event.id) : onJoin(event.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (navigator.share) navigator.share({ title: event.title, text: event.description, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    alert('Reported. Thanks for keeping Circl safe!');
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5 mb-4" onClick={() => onSelectEvent(event.id)}>
      {/* Image */}
      <div className="relative">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-8xl">{CATEGORY_EMOJIS[event.category] ?? '✨'}</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isTonight && (
            <span className="bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">🌙 Tonight</span>
          )}
          {!isFull && spotsLeft <= 5 && (
            <span className="bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </span>
          )}
          {isFull && (
            <span className="bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">Full</span>
          )}
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
            className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm font-bold">
            ···
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-9 z-20 bg-white rounded-2xl shadow-lg border border-gray-100 w-36 py-1">
                <button onClick={handleShare} className="w-full text-left px-4 py-2.5 text-sm text-gray-700">Share plan</button>
                <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm text-red-500">Report</button>
              </div>
            </>
          )}
        </div>

        {/* Organizer pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
          <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-5 h-5 rounded-full object-cover" />
          <span className="text-white text-xs font-semibold">{event.organizer.name.split(' ')[0]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-secondary leading-tight">{event.title}</h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">{dateStr} · {event.location}</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">{event.category}</span>
        </div>

        {event.description.length > 0 && (
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {event.description.length > 90 ? event.description.substring(0, 90) + '…' : event.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <p className="text-sm font-semibold text-gray-500">
            <span className="text-secondary font-bold">{joinerIds.length}</span> going · <span className={spotsLeft <= 3 && !isFull ? 'text-accent font-bold' : ''}>{isFull ? 'Full' : `${spotsLeft} spots left`}</span>
          </p>
          {isOrganizer ? (
            <span className="font-semibold py-2 px-4 rounded-2xl text-xs bg-gray-100 text-gray-500" onClick={e => e.stopPropagation()}>Your plan ✦</span>
          ) : (
            <button
              onClick={handleJoinLeave}
              disabled={!isAttending && isFull}
              className={`font-bold py-2 px-5 rounded-2xl text-sm transition-all ${
                isAttending ? 'bg-gray-100 text-gray-600'
                : isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white shadow-sm active:scale-95'
              }`}
            >
              {isAttending ? '✓ Joined' : isFull ? 'Full' : 'Join the Circl'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
