import React, { useState } from 'react';
import { Event, User, Category } from '../../types';
import EventCard from '../EventCard';

interface HomeScreenProps {
  events: Event[];
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToMap: () => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
}

type Tab = 'joined' | 'foryou';

const HomeScreen: React.FC<HomeScreenProps> = ({ events, currentUser, onSelectEvent, onNavigateToCreate, onNavigateToMap, onJoin, onLeave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('foryou');
  const now = new Date();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const visibleEvents = events
    .filter(event => {
      if (activeTab === 'joined') {
        return event.attendeeIds.includes(currentUser.id) && new Date(event.date) >= now;
      }
      return event.organizer.id !== currentUser.id && new Date(event.date) >= now;
    })
    .filter(event => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q)
      );
    })
    .filter(event => !activeCategory || event.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="sticky top-0 bg-white z-10 px-4 pt-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div />
          <h1 className="text-xl font-bold text-secondary">Circl</h1>
          <button onClick={() => { setShowSearch(v => !v); setSearchQuery(''); }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {showSearch && (
          <div className="pb-3">
            <input
              autoFocus
              type="text"
              placeholder="Search events, locations, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
            />
          </div>
        )}

        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`py-3 text-sm font-semibold ${activeTab === 'foryou' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`py-3 text-sm font-semibold ${activeTab === 'joined' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            My Events
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 pt-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${!activeCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button onClick={onNavigateToCreate} className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg">
            Create Event
          </button>
          <button onClick={onNavigateToMap} className="bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498h-7a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-10.5a2.25 2.25 0 00-2.25-2.25z" />
            </svg>
            Map
          </button>
        </div>
        {visibleEvents.length > 0 ? (
          <div className="space-y-4">
            {visibleEvents.map(event => (
              <EventCard key={event.id} event={event} currentUser={currentUser} onSelectEvent={onSelectEvent} onJoin={onJoin} onLeave={onLeave} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">
              {searchQuery
                ? 'No events match your search'
                : activeCategory
                ? `No ${activeCategory} events coming up`
                : activeTab === 'joined'
                ? 'No upcoming events'
                : 'No events around you yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'joined'
                ? 'Join events from Discover to see them here'
                : 'Check back soon or create your own'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
