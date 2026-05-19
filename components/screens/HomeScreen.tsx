import React, { useState } from 'react';
import { Event, User } from '../../types';
import EventCard from '../EventCard';

interface HomeScreenProps {
  events: Event[];
  currentUser: User;
  onSelectEvent: (eventId: number) => void;
  onNavigateToCreate: () => void;
  onJoin: (eventId: number) => void;
  onLeave: (eventId: number) => void;
}

type Tab = 'following' | 'foryou';

const HomeScreen: React.FC<HomeScreenProps> = ({ events, currentUser, onSelectEvent, onNavigateToCreate, onJoin, onLeave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('foryou');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleEvents = events
    .filter(event => {
      if (activeTab === 'following') {
        // Events you've joined from other people — your schedule
        return event.attendeeIds.includes(currentUser.id);
      }
      // Discovery — events from other users only
      return event.organizer.id !== currentUser.id;
    })
    .filter(event => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q)
      );
    });

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
            onClick={() => setActiveTab('following')}
            className={`py-3 text-sm font-semibold ${activeTab === 'following' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab('foryou')}
            className={`py-3 text-sm font-semibold ${activeTab === 'foryou' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            For you
          </button>
        </div>
      </header>

      <div className="p-4">
        <button onClick={onNavigateToCreate} className="w-full bg-primary text-white font-semibold py-3 rounded-lg mb-4">
          Create Event
        </button>
        {visibleEvents.length > 0 ? (
          <div className="space-y-4">
            {visibleEvents.map(event => (
              <EventCard key={event.id} event={event} currentUser={currentUser} onSelectEvent={onSelectEvent} onJoin={onJoin} onLeave={onLeave} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-12">
            {searchQuery ? 'No events match your search.' : 'No events yet — join some to see them here.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
