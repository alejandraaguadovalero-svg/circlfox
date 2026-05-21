import React, { useState } from 'react';
import { Event, User } from '../../types';
import { MapPinIcon, UsersIcon, CalendarIcon } from '../icons';
import { useLanguage, LANGUAGE_OPTIONS } from '../../lib/i18n';

const CATEGORY_EMOJIS: Record<string, string> = {
  Sports: '⚽', Drinks: '🍹', Arts: '🎨', 'Study Sessions': '📚',
  Food: '🍜', Music: '🎵', Outdoors: '🌿', Other: '✨',
};

interface EventDetailScreenProps {
  event: Event;
  allUsers: User[];
  currentUser: User;
  onBack: () => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  onGoToChat?: (eventId: string) => void;
  onSelectUser?: (userId: string) => void;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ event, allUsers, currentUser, onBack, onJoin, onLeave, onDelete, onGoToChat, onSelectUser }) => {
  const { t } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const joinerIds = event.attendeeIds.filter(id => id !== event.organizer.id);
  const attendees = joinerIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
  const isAttending = event.attendeeIds.includes(currentUser.id);
  const isFull = joinerIds.length >= event.maxParticipants;
  const isOrganizer = event.organizer.id === currentUser.id;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedEndTime = event.endDate ? new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
  const timeDisplay = formattedEndTime ? `${formattedTime} – ${formattedEndTime}` : formattedTime;

  return (
    <div className="bg-white h-full pb-24">
      <div className="relative">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-60 object-cover" />
        ) : (
          <div className="w-full h-60 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-8xl">{CATEGORY_EMOJIS[event.category] ?? '✨'}</span>
          </div>
        )}
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
      </div>

      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{event.title}</h1>
        
        <div className="mt-6 space-y-4 text-gray-700">
            <InfoRow icon={<CalendarIcon className="w-6 h-6 text-primary" />} text={`${formattedDate} · ${timeDisplay}`} />
            <InfoRow icon={<MapPinIcon className="w-6 h-6 text-primary" />} text={event.location} />
            <InfoRow icon={<UsersIcon className="w-6 h-6 text-primary" />} text={`${joinerIds.length} / ${event.maxParticipants} going`} />
        </div>

        {(event.languages ?? []).length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t.detail_languages}</p>
            <div className="flex flex-wrap gap-2">
              {(event.languages ?? []).map(lang => {
                const opt = LANGUAGE_OPTIONS.find(o => o.value === lang);
                if (!opt) return null;
                return (
                  <span key={lang} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                    <span>{opt.flag}</span>
                    <span>{opt.native}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.detail_description}</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
        </div>

        <div className="mx-4 mt-4 bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🙋</span>
          <div>
            <p className="font-bold text-sm text-secondary">{t.detail_alone_title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t.detail_alone_sub}</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.detail_whos_going} ({joinerIds.length})</h2>
            <div className="flex flex-wrap gap-4">
            {attendees.map(user => (
                <button key={user.id} onClick={() => onSelectUser?.(user.id)} className="flex flex-col items-center w-16 text-center">
                    <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
                    <p className="text-xs mt-1 text-gray-600 truncate w-full">{user.name}</p>
                </button>
            ))}
            </div>
        </div>
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        {isOrganizer ? (
          <div className="flex gap-3">
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-50 text-red-500 font-bold py-3 px-4 rounded-lg"
              >
                {t.detail_delete}
              </button>
            )}
            {onGoToChat && (
              <button
                onClick={() => onGoToChat(event.id)}
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t.detail_group_chat}
              </button>
            )}
          </div>
        ) : isAttending ? (
          <div className="flex gap-3">
            <button
              onClick={() => onLeave(event.id)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg"
            >
              {t.detail_leave}
            </button>
            {onGoToChat && (
              <button
                onClick={() => onGoToChat(event.id)}
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t.detail_group_chat}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onJoin(event.id)}
            disabled={isFull}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400"
          >
            {isFull ? t.detail_full : t.detail_join}
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">{t.detail_delete_title}</h3>
            <p className="text-sm text-gray-500 mt-2">{t.detail_delete_body(event.title)}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl">{t.detail_cancel}</button>
              <button onClick={() => { setShowDeleteConfirm(false); onDelete?.(event.id); }} className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl">{t.detail_delete_confirm}</button>
            </div>
          </div>
        </div>
      )}
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