import React from 'react';
import { User, Event } from '../types';
import { useLanguage, LANGUAGE_OPTIONS } from '../lib/i18n';

const CATEGORY_EMOJIS: Record<string, string> = {
  Sports: '⚽', Drinks: '🍹', Arts: '🎨', 'Study Sessions': '📚',
  Food: '🍜', Music: '🎵', Outdoors: '🌿', Other: '✨',
};

interface UserProfileModalProps {
  user: User;
  events: Event[];
  currentUser: User;
  onClose: () => void;
  onGoToChat?: (eventId: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, events, currentUser, onClose, onGoToChat }) => {
  const { t } = useLanguage();
  const sharedEvents = events.filter(e =>
    e.attendeeIds.includes(user.id) && e.attendeeIds.includes(currentUser.id)
  );

  const langs = (user.spokenLanguages ?? []).map(v => LANGUAGE_OPTIONS.find(o => o.value === v)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-t-2xl pb-10 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white pt-4 pb-2 px-6">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        <div className="px-6">
          {/* Avatar & name */}
          <div className="flex flex-col items-center text-center mt-2">
            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full shadow-md object-cover" />
            <h2 className="text-2xl font-bold text-gray-900 mt-3">{user.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {user.city} · {user.age} {t.profile_years_old}
              {user.nationality ? ` · ${user.nationality}` : ''}
            </p>
            {langs.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                {langs.map(l => (
                  <span key={l!.value} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span>{l!.flag}</span><span>{l!.native}</span>
                  </span>
                ))}
              </div>
            )}
            {user.bio && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{user.bio}</p>}
          </div>

          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold text-gray-800 mb-2">{t.profile_vibe}</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map(interest => (
                  <span key={interest} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared events */}
          {sharedEvents.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold text-gray-800 mb-2">{t.modal_events_common} ({sharedEvents.length})</h3>
              <div className="space-y-2">
                {sharedEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">
                        {CATEGORY_EMOJIS[event.category] ?? '✨'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 truncate">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message button */}
          {sharedEvents.length > 0 && onGoToChat ? (
            <button
              onClick={() => { onClose(); onGoToChat(sharedEvents[0].id); }}
              className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-xl"
            >
              {t.modal_message} {user.name.split(' ')[0]}
            </button>
          ) : (
            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">{t.modal_no_chat(user.name.split(' ')[0])}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
