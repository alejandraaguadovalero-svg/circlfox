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
type MoodFilter = 'all' | 'tonight' | 'chill' | 'active' | Category;

const MOOD_FILTERS: { id: MoodFilter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✦' },
  { id: 'tonight', label: 'Tonight', emoji: '🌙' },
  { id: 'chill', label: 'Chill', emoji: '☕' },
  { id: 'active', label: 'Active', emoji: '⚡' },
  { id: Category.FOOD, label: 'Food', emoji: '🍜' },
  { id: Category.MUSIC, label: 'Music', emoji: '🎵' },
  { id: Category.ARTS, label: 'Creative', emoji: '🎨' },
  { id: Category.STUDY, label: 'Study', emoji: '📚' },
  { id: Category.OTHER, label: 'Other', emoji: '✨' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ events, currentUser, onSelectEvent, onNavigateToCreate, onNavigateToMap, onJoin, onLeave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('foryou');
  const now = new Date();
  const todayStr = now.toDateString();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<MoodFilter>('all');

  const firstName = currentUser.name.split(' ')[0];

  const applyMood = (event: Event): boolean => {
    if (moodFilter === 'all') return true;
    if (moodFilter === 'tonight') return new Date(event.date).toDateString() === todayStr;
    if (moodFilter === 'chill') return event.category === Category.DRINKS || event.category === Category.FOOD || event.category === Category.STUDY;
    if (moodFilter === 'active') return event.category === Category.SPORTS || event.category === Category.OUTDOORS;
    return event.category === moodFilter;
  };

  const visibleEvents = events
    .filter(event => {
      if (activeTab === 'joined') return event.attendeeIds.includes(currentUser.id) && new Date(event.date) >= now;
      return event.organizer.id !== currentUser.id && new Date(event.date) >= now;
    })
    .filter(event => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return event.title.toLowerCase().includes(q) || event.location.toLowerCase().includes(q) || event.category.toLowerCase().includes(q);
    })
    .filter(applyMood);

  const tonightCount = events.filter(e => new Date(e.date).toDateString() === todayStr && e.organizer.id !== currentUser.id && new Date(e.date) >= now).length;

  return (
    <div className="bg-cream min-h-screen">
      <header className="sticky top-0 bg-cream z-10 px-4 pt-4 border-b border-black/5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Hey {firstName} 👋</p>
            <h1 className="text-xl font-bold text-secondary leading-tight">What are you up for?</h1>
          </div>
          <button onClick={() => { setShowSearch(v => !v); setSearchQuery(''); }} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {showSearch && (
          <div className="pb-3">
            <input autoFocus type="text" placeholder="Search plans, places, vibes..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl px-4 py-2.5 text-sm focus:outline-none shadow-sm border border-black/5" />
          </div>
        )}

        {tonightCount > 0 && !showSearch && (
          <div className="flex items-center gap-2 bg-primary/10 rounded-2xl px-3 py-2 mb-3">
            <span className="text-base">🌙</span>
            <p className="text-sm font-semibold text-primary">{tonightCount} plan{tonightCount > 1 ? 's' : ''} happening tonight near you</p>
          </div>
        )}

        <div className="flex space-x-6 mb-1">
          <button onClick={() => setActiveTab('foryou')}
            className={`py-2.5 text-sm font-bold ${activeTab === 'foryou' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>
            Discover
          </button>
          <button onClick={() => setActiveTab('joined')}
            className={`py-2.5 text-sm font-bold ${activeTab === 'joined' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>
            My Plans
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {MOOD_FILTERS.map(({ id, label, emoji }) => (
            <button key={id} onClick={() => setMoodFilter(moodFilter === id ? 'all' : id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${moodFilter === id ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-600 border border-black/5'}`}>
              <span>{emoji}</span><span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button onClick={onNavigateToCreate} className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl shadow-sm">
            ✦ Start a Circl
          </button>
          <button onClick={onNavigateToMap} className="bg-white text-gray-700 font-semibold py-3 px-4 rounded-2xl flex items-center gap-1.5 border border-black/5 shadow-sm">
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
            <p className="font-bold text-gray-700 text-lg">
              {searchQuery ? 'No plans match your search'
                : moodFilter !== 'all' ? 'Nothing in this vibe yet'
                : activeTab === 'joined' ? 'No upcoming plans'
                : 'No plans around you yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'joined'
                ? 'Join plans from Discover to see them here'
                : 'Be the first — start a Circl!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
