import React from 'react';
import { User, Event, Category, Activity, ActivityType, Message } from './types';

export const CirclFoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M141.673 135.852C140.852 144.912 133.511 152.25 124.451 152.25H75.5489C66.4889 152.25 59.1483 144.912 58.3274 135.852L52.5 78.75H147.5L141.673 135.852Z" fill="#A790FE" stroke="#3C3C3C" strokeWidth="5" strokeLinejoin="round"/>
    <path d="M117.75 62.25C117.75 62.25 121.75 78.75 106 78.75H94C78.25 78.75 82.25 62.25 82.25 62.25" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M127.5 78.75C127.5 78.75 119 90.75 100 90.75C81 90.75 72.5 78.75 72.5 78.75H127.5Z" fill="#8E72E8" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M129 44.5C129 60.375 116.375 73.5 100.5 73.5C84.625 73.5 72 60.375 72 44.5C72 28.625 84.625 15.5 100.5 15.5C116.375 15.5 129 28.625 129 44.5Z" fill="#F98C3F"/>
    <path d="M130.333 45.6667C130.333 62.0824 116.916 75 100.5 75C84.0842 75 70.6667 62.0824 70.6667 45.6667C70.6667 29.2509 84.0842 16.3333 100.5 16.3333C116.916 16.3333 130.333 29.2509 130.333 45.6667Z" stroke="#3C3C3C" strokeWidth="5" strokeLinejoin="round"/>
    <path d="M111.5 28.5L122.5 17" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M89.5 28.5L78.5 17" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M109.833 30.3333C109.833 30.3333 118.333 41.3333 126.333 42.3333" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round"/>
    <path d="M91.1667 30.3333C91.1667 30.3333 82.6667 41.3333 74.6667 42.3333" stroke="#3C3C3C" strokeWidth="5" strokeLinecap="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M117.833 48.3333C117.833 60.4167 100.5 71.6667 100.5 71.6667C100.5 71.6667 83.1667 60.4167 83.1667 48.3333C83.1667 36.25 89.1667 29.8333 100.5 29.8333C111.833 29.8333 117.833 36.25 117.833 48.3333Z" fill="white"/>
    <path d="M117.833 48.3333C117.833 60.4167 100.5 71.6667 100.5 71.6667C100.5 71.6667 83.1667 60.4167 83.1667 48.3333C83.1667 36.25 89.1667 29.8333 100.5 29.8333C111.833 29.8333 117.833 36.25 117.833 48.3333Z" stroke="#3C3C3C" strokeWidth="5" strokeLinejoin="round"/>
    <path d="M113 47C113 49.7614 110.761 52 108 52C105.239 52 103 49.7614 103 47C103 44.2386 105.239 42 108 42C110.761 42 113 44.2386 113 47Z" fill="#3C3C3C"/>
    <path d="M97 47C97 49.7614 94.7614 52 92 52C89.2386 52 87 49.7614 87 47C87 44.2386 89.2386 42 92 42C94.7614 42 97 44.2386 97 47Z" fill="#3C3C3C"/>
    <circle cx="109.5" cy="45.5" r="1.5" fill="white"/>
    <circle cx="93.5" cy="45.5" r="1.5" fill="white"/>
    <path d="M100.5 56.5C101.881 56.5 103 57.6193 103 59C103 60.3807 101.881 61.5 100.5 61.5C99.1193 61.5 98 60.3807 98 59C98 57.6193 99.1193 56.5 100.5 56.5Z" fill="#3C3C3C"/>
    <path d="M108 65.5C108 65.5 104.5 70.5 100.5 70.5C96.5 70.5 93 65.5 93 65.5C93 65.5 96.5 67.5 100.5 67.5C104.5 67.5 108 65.5 108 65.5Z" fill="#3C3C3C"/>
    <path d="M105.5 66.5C105.5 66.5 102.75 69 100.5 69C98.25 69 95.5 66.5 95.5 66.5C95.5 66.5 98.25 67.5 100.5 67.5C102.75 67.5 105.5 66.5 105.5 66.5Z" fill="#E57373"/>
  </svg>
);

export const MOCK_USERS: User[] = [
  { id: 'mock-1', name: 'Alex', age: 22, city: 'Metro City', bio: 'Student at Metro U, love hiking and trying new food spots!', interests: ['Running', 'Football', 'Coffee', 'Clubbing'], avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'mock-2', name: 'Mia', age: 25, city: 'Metro City', bio: 'Young professional in tech. Always down for a board game night or a concert.', interests: ['Board Games', 'Live Music', 'Coding'], avatarUrl: 'https://i.pravatar.cc/150?u=mia' },
  { id: 'mock-3', name: 'starryxkes23', age: 19, city: 'Metro City', bio: 'Digital nomad passing through. Let\'s grab a coffee and talk about travel.', interests: ['Travel', 'Coffee', 'Startups'], avatarUrl: 'https://i.pravatar.cc/150?u=starryxkes23' },
  { id: 'mock-4', name: 'netuibonomad', age: 24, city: 'Metro City', bio: 'Art student who loves museum trips and outdoor painting.', interests: ['Art', 'Museums', 'Nature'], avatarUrl: 'https://i.pravatar.cc/150?u=netuibonomad' },
  { id: 'mock-5', name: 'lunavoyager', age: 21, city: 'Metro City', bio: 'Loves photography and exploring hidden gems in the city.', interests: ['Photography', 'Exploring', 'History'], avatarUrl: 'https://i.pravatar.cc/150?u=lunavoyager' },
  { id: 'mock-6', name: 'shadowxplorer', age: 26, city: 'Metro City', bio: 'Into urban exploration and street art.', interests: ['Urban Exploration', 'Street Art', 'Skating'], avatarUrl: 'https://i.pravatar.cc/150?u=shadowxplorer' },
];

export const MOCK_EVENTS: Event[] = [
  { id: 1, title: 'City Bike Tour', description: 'Join us for a scenic bike tour around the city highlights. All skill levels welcome! We\'ll finish with food nearby.', imageUrl: 'https://images.unsplash.com/photo-1559348331-57d345336c32?q=80&w=2070&auto=format&fit=crop', date: '2026-05-24T12:00:00', location: 'City Hall', lat: 37.779, lng: -122.419, organizer: MOCK_USERS[2], attendeeIds: ['mock-2', 'mock-4', 'mock-3', 'mock-5', 'mock-6'], maxParticipants: 12, category: Category.SPORTS },
  { id: 2, title: 'Football Match', description: 'Looking for players for a friendly game on Saturday at the park field. All levels welcome!', imageUrl: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format&fit=crop', date: '2026-05-28T16:00:00', location: 'Golden Gate Park', lat: 37.769, lng: -122.486, organizer: MOCK_USERS[3], attendeeIds: ['mock-3', 'mock-4'], maxParticipants: 22, category: Category.SPORTS },
  { id: 3, title: 'Indie Band Showcase', description: 'Discover the next big thing in local music. A few cool indie bands are playing at The Underground. Come for the music, stay for the good vibes.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop', date: '2026-06-05T20:00:00', location: 'The Mission District', lat: 37.760, lng: -122.421, organizer: MOCK_USERS[2], attendeeIds: ['mock-3', 'mock-2'], maxParticipants: 20, category: Category.MUSIC },
  { id: 4, title: 'Sunset Drinks at Dolores', description: 'Casual drinks in the park as the sun goes down. Bring your own drinks and good vibes. Everyone welcome!', imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=2070&auto=format&fit=crop', date: '2026-05-15T18:30:00', location: 'Dolores Park', lat: 37.759, lng: -122.426, organizer: MOCK_USERS[1], attendeeIds: ['mock-2', 'mock-5'], maxParticipants: 15, category: Category.DRINKS },
];

export const MOCK_EVENT_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, senderId: 'mock-3', text: "Hey everyone! So excited for the bike tour 🚴", timestamp: "2026-05-20T09:00:00" },
    { id: 2, senderId: 'mock-4', text: "Same! Should we bring water bottles?", timestamp: "2026-05-20T09:08:00" },
    { id: 3, senderId: 'mock-2', text: "Yes, and wear comfortable shoes. Route is ~12km", timestamp: "2026-05-20T09:15:00" },
    { id: 4, senderId: 'mock-5', text: "I'll be there! What time should we meet at the start?", timestamp: "2026-05-20T10:30:00" },
    { id: 5, senderId: 'mock-3', text: "Let's meet 10 min early at the main entrance 📍", timestamp: "2026-05-20T10:45:00" },
    { id: 6, senderId: 'mock-6', text: "Can't wait! I'll bring some snacks for the group 🍌", timestamp: "2026-05-20T11:00:00" },
  ],
  2: [
    { id: 1, senderId: 'mock-4', text: "Still looking for players! Tell your friends 🙌", timestamp: "2026-05-19T08:00:00" },
    { id: 2, senderId: 'mock-3', text: "I'm in! Confirming my spot now", timestamp: "2026-05-19T08:30:00" },
    { id: 3, senderId: 'mock-4', text: "Perfect, we need 8 more. Spread the word!", timestamp: "2026-05-19T08:35:00" },
  ],
};

export const MOCK_ACTIVITIES: Activity[] = [
    { id: 1, type: ActivityType.FOLLOW, user: MOCK_USERS[2], timestamp: "3d", details: "started following you"},
    { id: 2, type: ActivityType.IMAGE_SHARE, user: MOCK_USERS[3], timestamp: "1d", details: "liked the image you shared to Coffee 25/02/25", relatedImageUrl: 'https://images.unsplash.com/photo-1511920183276-5742f4b5b5ba?q=80&w=1974&auto=format&fit=crop'},
    { id: 3, type: ActivityType.NEW_EVENT, user: MOCK_USERS[1], timestamp: "2d", details: "New Event", relatedEvent: MOCK_EVENTS[1] },
    { id: 4, type: ActivityType.SAVE, user: MOCK_USERS[4], timestamp: "3d", details: "saves the image you shared to Coffee 25/02/25", relatedImageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1974&auto=format&fit=crop' },
    { id: 5, type: ActivityType.REPLY, user: MOCK_USERS[4], timestamp: "4d", details: "Replied to the image: Should we meet again tmr?", relatedImageUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1974&auto=format&fit=crop' },
    { id: 6, type: ActivityType.LIKE, user: MOCK_USERS[3], timestamp: "5d", details: "Replied to the image: This is so adorable!!!", relatedImageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1974&auto=format&fit=crop' },
];
