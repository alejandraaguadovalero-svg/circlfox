import React, { useState } from 'react';
import { User, Event, Category } from '../../types';

interface ActivitiesScreenProps {
  currentUser: User;
  events: Event[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Sports: '⚽',
  Drinks: '🍹',
  Arts: '🎨',
  'Study Sessions': '📚',
  Food: '🍜',
  Music: '🎵',
  Outdoors: '🌿',
  Other: '✨',
};

const FILTERS = ['All', 'Joined', 'Created', 'Upcoming', 'Past'];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatUpcomingDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ currentUser, events }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const now = new Date();

  const joinedEvents = events.filter(e =>
    e.attendeeIds.includes(currentUser.id) && e.organizer.id !== currentUser.id
  );
  const createdEvents = events.filter(e => e.organizer.id === currentUser.id);
  const upcomingEvents = events.filter(e =>
    e.attendeeIds.includes(currentUser.id) && new Date(e.date) >= now
  );
  const pastEvents = events.filter(e =>
    e.attendeeIds.includes(currentUser.id) && new Date(e.date) < now
  );

  let displayEvents: { event: Event; label: string; sub: string }[] = [];

  if (activeFilter === 'All') {
    displayEvents = [
      ...createdEvents.map(e => ({ event: e, label: 'You created', sub: new Date(e.date) >= now ? formatUpcomingDate(e.date) : formatRelativeDate(e.date) })),
      ...joinedEvents.map(e => ({ event: e, label: 'You joined', sub: new Date(e.date) >= now ? formatUpcomingDate(e.date) : formatRelativeDate(e.date) })),
    ].sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
  } else if (activeFilter === 'Joined') {
    displayEvents = joinedEvents.map(e => ({ event: e, label: 'You joined', sub: new Date(e.date) >= now ? formatUpcomingDate(e.date) : formatRelativeDate(e.date) }))
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
  } else if (activeFilter === 'Created') {
    displayEvents = createdEvents.map(e => ({ event: e, label: 'You created', sub: new Date(e.date) >= now ? formatUpcomingDate(e.date) : formatRelativeDate(e.date) }))
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
  } else if (activeFilter === 'Upcoming') {
    displayEvents = upcomingEvents.map(e => ({ event: e, label: e.organizer.id === currentUser.id ? 'You created' : 'You joined', sub: formatUpcomingDate(e.date) }))
      .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
  } else if (activeFilter === 'Past') {
    displayEvents = pastEvents.map(e => ({ event: e, label: e.organizer.id === currentUser.id ? 'You created' : 'You attended', sub: formatRelativeDate(e.date) }))
      .sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex items-center">
        <h1 className="text-xl font-bold text-secondary mx-auto">Activity</h1>
      </header>

      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {displayEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-semibold text-gray-700">No activity yet</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeFilter === 'Created' ? 'Create your first event to see it here.' : 'Join events to start building your activity.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayEvents.map(({ event, label, sub }) => (
                <div key={event.id} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <span>{CATEGORY_EMOJIS[event.category] ?? '✨'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-bold">{label}</span>
                      <span className="text-gray-600"> · {event.title}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.location} · {sub}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesScreen;
