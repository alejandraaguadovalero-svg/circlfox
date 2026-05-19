import React from 'react';
import { Event, User } from '../types';
import { UsersIcon } from './icons';

interface EventCardProps {
  event: Event;
  currentUser: User;
  onSelectEvent: (eventId: number) => void;
  onJoin: (eventId: number) => void;
  onLeave: (eventId: number) => void;
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
  const isAttending = event.attendeeIds.includes(currentUser.id);
  const isFull = event.attendeeIds.length >= event.maxParticipants;

  const handleJoinLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    isAttending ? onLeave(event.id) : onJoin(event.id);
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
        <button className="ml-auto text-gray-500 text-lg leading-none">···</button>
      </div>

      <div className="cursor-pointer" onClick={() => onSelectEvent(event.id)}>
        <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-secondary">{event.title}</h3>
        <p className="text-gray-500 text-sm mt-1">{event.description.substring(0, 100)}...</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {event.attendeeIds.slice(0, 3).map(id => (
                <img key={id} src={`https://i.pravatar.cc/150?u=user${id}`} alt="" className="w-8 h-8 rounded-full border-2 border-white" />
              ))}
            </div>
            {event.attendeeIds.length > 0 && (
              <p className="ml-2 text-sm text-gray-600">
                {event.attendeeIds.length} attendee{event.attendeeIds.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default EventCard;
