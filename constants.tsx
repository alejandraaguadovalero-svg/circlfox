import React from 'react';
import { User, Activity, ActivityType } from './types';

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
  { id: 'mock-1', name: 'Alex López', username: 'alexlopez', age: 22, city: 'Madrid', bio: 'Student, love hiking and trying new food spots!', interests: ['Running', 'Football', 'Coffee', 'Clubbing'], avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'mock-2', name: 'Mia Ruiz', username: 'miaruiz', age: 25, city: 'Madrid', bio: 'Young professional in tech. Always down for a board game night.', interests: ['Board Games', 'Music', 'Hiking'], avatarUrl: 'https://i.pravatar.cc/150?u=mia' },
  { id: 'mock-3', name: 'Sara Martín', username: 'starryxkes23', age: 19, city: 'Madrid', bio: 'Let\'s grab a coffee and talk about travel.', interests: ['Travel', 'Coffee', 'Art'], avatarUrl: 'https://i.pravatar.cc/150?u=starryxkes23' },
  { id: 'mock-4', name: 'Carlos Vega', username: 'carlosvega', age: 24, city: 'Madrid', bio: 'Art student who loves museum trips and outdoor painting.', interests: ['Art', 'Photography', 'Outdoors'], avatarUrl: 'https://i.pravatar.cc/150?u=netuibonomad' },
  { id: 'mock-5', name: 'Luna García', username: 'lunavoyager', age: 21, city: 'Madrid', bio: 'Loves photography and exploring hidden gems in the city.', interests: ['Photography', 'Hiking', 'Gaming'], avatarUrl: 'https://i.pravatar.cc/150?u=lunavoyager' },
  { id: 'mock-6', name: 'Diego Sanz', username: 'diegosanz', age: 26, city: 'Madrid', bio: 'Into urban exploration and street art.', interests: ['Art', 'Music', 'Running'], avatarUrl: 'https://i.pravatar.cc/150?u=shadowxplorer' },
];

export const MOCK_ACTIVITIES: Activity[] = [
    { id: 1, type: ActivityType.FOLLOW, user: MOCK_USERS[2], timestamp: "3d", details: "started following you"},
    { id: 2, type: ActivityType.IMAGE_SHARE, user: MOCK_USERS[3], timestamp: "1d", details: "liked the image you shared to Coffee 25/02/25", relatedImageUrl: 'https://images.unsplash.com/photo-1511920183276-5742f4b5b5ba?q=80&w=1974&auto=format&fit=crop'},
    { id: 3, type: ActivityType.NEW_EVENT, user: MOCK_USERS[1], timestamp: "2d", details: "New Event" },
    { id: 4, type: ActivityType.SAVE, user: MOCK_USERS[4], timestamp: "3d", details: "saves the image you shared to Coffee 25/02/25", relatedImageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1974&auto=format&fit=crop' },
    { id: 5, type: ActivityType.REPLY, user: MOCK_USERS[4], timestamp: "4d", details: "Replied to the image: Should we meet again tmr?", relatedImageUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1974&auto=format&fit=crop' },
    { id: 6, type: ActivityType.LIKE, user: MOCK_USERS[3], timestamp: "5d", details: "Replied to the image: This is so adorable!!!", relatedImageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1974&auto=format&fit=crop' },
];
