import React, { useEffect, useRef, useState } from 'react';
import { Event, Category, User } from '../../types';
import { MapPinIcon, UsersIcon } from '../icons';
import { useLanguage } from '../../lib/i18n';

declare global {
  interface Window { L: any; }
}

interface BookingsScreenProps {
  events: Event[];
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
}

type SortOption = 'date' | 'popular';

const CATEGORY_EMOJIS: Partial<Record<Category, string>> = {
  [Category.SPORTS]: '⚽',
  [Category.DRINKS]: '🍹',
  [Category.ARTS]: '🎨',
  [Category.STUDY]: '📚',
  [Category.FOOD]: '🍜',
  [Category.MUSIC]: '🎵',
  [Category.OUTDOORS]: '🌿',
  [Category.OTHER]: '✨',
};

const EventListItem: React.FC<{ event: Event; currentUserId: string; organizerId: string; onSelectEvent: (id: string) => void }> = ({ event, currentUserId, organizerId, onSelectEvent }) => {
  const isAttending = event.attendeeIds.includes(currentUserId);
  const joinerCount = event.attendeeIds.filter(id => id !== organizerId).length;
  return (
    <div onClick={() => onSelectEvent(event.id)} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm cursor-pointer active:bg-gray-50">
      <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-3xl">
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          : <span>{CATEGORY_EMOJIS[event.category] ?? '✨'}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 truncate">{event.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{event.location}</p>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <UsersIcon className="w-3.5 h-3.5" />
          <span>{joinerCount} / {event.maxParticipants} going</span>
        </div>
        <div className={`mt-2 inline-block font-semibold py-1 px-3 rounded-lg text-xs ${isAttending ? 'bg-gray-200 text-gray-700' : 'bg-primary/10 text-primary'}`}>
          {isAttending ? 'Joined' : 'Join'}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold text-primary">{CATEGORY_EMOJIS[event.category]}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
        <p className="text-xs text-gray-400">{new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
};

const BookingsScreen: React.FC<BookingsScreenProps> = ({ events, currentUser, onSelectEvent }) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const onSelectEventRef = useRef(onSelectEvent);
  const markerEventIds = useRef<Set<string>>(new Set());
  onSelectEventRef.current = onSelectEvent;

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  const filteredEvents = events
    .filter(e => !activeCategory || e.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
      const aJoiners = a.attendeeIds.filter(id => id !== a.organizer.id).length;
      const bJoiners = b.attendeeIds.filter(id => id !== b.organizer.id).length;
      return bJoiners - aJoiners;
    });

  // Initialize map once on mount, destroy on unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = window.L.map(mapContainerRef.current).setView([40.4168, -3.7038], 13);
    mapRef.current = map;
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
      markerEventIds.current = new Set();
    };
  }, []);

  // Add markers for any events not yet on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    events.forEach(event => {
      if (markerEventIds.current.has(event.id)) return;
      markerEventIds.current.add(event.id);
      const marker = window.L.marker([event.lat, event.lng]).addTo(map);
      marker.bindPopup(`<b>${event.title}</b><br>${event.location}`);
      marker.on('click', () => onSelectEventRef.current(event.id));
    });
  }, [events]);

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-200 flex justify-between items-center">
        <div />
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          <h1 className="text-lg font-bold text-secondary">{t.map_title}</h1>
        </div>
        <div className="w-6" />
      </header>

      <div className="relative" style={{ height: '260px' }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      <div className="p-4 pb-24">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterSheet(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full shadow-sm text-sm font-semibold transition-colors ${activeCategory ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {activeCategory ?? t.map_filter}
            </button>
            <button
              onClick={() => setShowSortSheet(true)}
              className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
              </svg>
              {sortBy === 'date' ? t.map_soonest : t.map_popular}
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-500">{t.map_events(filteredEvents.length)}</span>
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-semibold text-gray-700">{t.map_empty}</p>
              <p className="text-sm text-gray-400 mt-1">{t.map_empty_sub}</p>
            </div>
          ) : filteredEvents.map(event => (
            <EventListItem key={event.id} event={event} currentUserId={currentUser.id} organizerId={event.organizer.id} onSelectEvent={onSelectEvent} />
          ))}
        </div>
      </div>

      {/* Filter sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowFilterSheet(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.map_filter_title}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setActiveCategory(null); setShowFilterSheet(false); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!activeCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {t.map_filter_all}
              </button>
              {Object.values(Category).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setShowFilterSheet(false); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <span>{CATEGORY_EMOJIS[cat]}</span><span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort sheet */}
      {showSortSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowSortSheet(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t.map_sort_title}</h2>
            <div className="space-y-2">
              {([['date', t.map_soonest_label, t.map_soonest_desc], ['popular', t.map_popular_label, t.map_popular_desc]] as const).map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => { setSortBy(val); setShowSortSheet(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${sortBy === val ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'}`}
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  {sortBy === val && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsScreen;
