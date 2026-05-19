import React from 'react';
import { Event, User } from '../../types';
import { MapPinIcon, UsersIcon, CalendarIcon } from '../icons';

interface EventDetailScreenProps {
  event: Event;
  allUsers: User[];
  currentUser: User;
  onBack: () => void;
  onJoin: (eventId: number) => void;
  onLeave: (eventId: number) => void;
  onGoToChat?: (eventId: number) => void;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ event, allUsers, currentUser, onBack, onJoin, onLeave, onGoToChat }) => {
  const attendees = event.attendeeIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
  const isAttending = event.attendeeIds.includes(currentUser.id);
  const isFull = event.attendeeIds.length >= event.maxParticipants;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="relative">
        <img src={event.imageUrl} alt={event.title} className="w-full h-60 object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
      </div>

      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{event.title}</h1>
        
        <div className="mt-6 space-y-4 text-gray-700">
            <InfoRow icon={<CalendarIcon className="w-6 h-6 text-primary" />} text={`${formattedDate} at ${formattedTime}`} />
            <InfoRow icon={<MapPinIcon className="w-6 h-6 text-primary" />} text={event.location} />
            <InfoRow icon={<UsersIcon className="w-6 h-6 text-primary" />} text={`${event.attendeeIds.length} / ${event.maxParticipants} going`} />
        </div>

        <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
        </div>

        <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Attendees ({attendees.length})</h2>
            <div className="flex flex-wrap gap-4">
            {attendees.map(user => (
                <div key={user.id} className="flex flex-col items-center w-16 text-center">
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                    <p className="text-xs mt-1 text-gray-600 truncate w-full">{user.name}</p>
                </div>
            ))}
            </div>
        </div>
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        {isAttending ? (
          <div className="flex gap-3">
            <button
              onClick={() => onLeave(event.id)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Leave
            </button>
            {onGoToChat && (
              <button
                onClick={() => onGoToChat(event.id)}
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Group Chat
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onJoin(event.id)}
            disabled={isFull}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
          >
            {isFull ? 'Event is Full' : 'Join Group'}
          </button>
        )}
      </div>
    </div>
  );
};

const InfoRow: React.FC<{icon: React.ReactNode, text: string}> = ({icon, text}) => (
    <div className="flex items-center gap-4">
        {icon}
        <span className="font-semibold">{text}</span>
    </div>
)

export default EventDetailScreen;