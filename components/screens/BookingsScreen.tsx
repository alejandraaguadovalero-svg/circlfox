import React, { useEffect, useRef } from 'react';
import { Event } from '../../types';
import { MapPinIcon, UsersIcon } from '../icons';
import { User } from '../../types';

// Declare Leaflet on the window object to satisfy TypeScript
declare global {
    interface Window { L: any; }
}

interface BookingsScreenProps {
  events: Event[];
  currentUser: User;
  onSelectEvent: (eventId: number) => void;
}

const Header: React.FC = () => (
    <header className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-200 flex justify-between items-center">
        <div/>
        <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5"/>
            <h1 className="text-lg font-bold text-secondary">San Francisco</h1>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
    </header>
);

const EventListItem: React.FC<{event: Event, currentUserId: number, onSelectEvent: (id: number) => void}> = ({ event, currentUserId, onSelectEvent }) => {
    const isAttending = event.attendeeIds.includes(currentUserId);
    return (
        <div onClick={() => onSelectEvent(event.id)} className="flex gap-4 p-2 bg-white rounded-lg shadow-sm cursor-pointer">
            <img src={event.imageUrl} alt={event.title} className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
                <h3 className="font-bold text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <UsersIcon className="w-4 h-4 mr-1"/>
                    <span>{event.attendeeIds.length} people interested</span>
                    <span className="mx-1">•</span>
                    <span>1.2 miles</span>
                </div>
                <button className={`mt-2 font-semibold py-1.5 px-4 rounded-lg text-sm w-full ${isAttending ? 'bg-gray-200 text-gray-700' : 'bg-primary text-white'}`}>
                    {isAttending ? 'Joined' : 'Join Group'}
                </button>
            </div>
        </div>
    );
};

const BookingsScreen: React.FC<BookingsScreenProps> = ({ events, currentUser, onSelectEvent }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const onSelectEventRef = useRef(onSelectEvent);
  const markerEventIds = useRef<Set<number>>(new Set());
  onSelectEventRef.current = onSelectEvent;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = window.L.map(mapContainerRef.current).setView([37.7749, -122.4194], 13);
      mapRef.current = map;
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);
      setTimeout(() => map.invalidateSize(), 100);
    }

    const map = mapRef.current;
    events.forEach(event => {
      if (markerEventIds.current.has(event.id)) return;
      markerEventIds.current.add(event.id);
      const marker = window.L.marker([event.lat, event.lng]).addTo(map);
      marker.bindPopup(`<b>${event.title}</b><br>${event.location}<br><small>Tap marker to view</small>`);
      marker.on('click', () => onSelectEventRef.current(event.id));
    });
  }, [events]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="relative" style={{ height: '300px' }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
      <div className="p-4 pb-24">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold">Filter</button>
            <button className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold">Sort</button>
          </div>
          <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm">{events.length} results</span>
        </div>
        <div className="space-y-3">
          {events.map(event => (
            <EventListItem key={event.id} event={event} currentUserId={currentUser.id} onSelectEvent={onSelectEvent} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingsScreen;