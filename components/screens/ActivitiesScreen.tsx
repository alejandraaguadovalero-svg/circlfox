import React, { useState } from 'react';
import { MOCK_ACTIVITIES } from '../../constants';
import { Activity, ActivityType } from '../../types';

const Header: React.FC = () => (
  <header className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex items-center">
    <h1 className="text-xl font-bold text-secondary mx-auto">Activity</h1>
  </header>
);

interface ActivityItemProps {
  activity: Activity;
  isFollowing: boolean;
  isJoined: boolean;
  onToggleFollow: (userId: number) => void;
  onToggleJoin: (eventId: number) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isFollowing, isJoined, onToggleFollow, onToggleJoin }) => {
  let actionButton = null;

  if (activity.type === ActivityType.FOLLOW) {
    actionButton = (
      <button
        onClick={() => onToggleFollow(activity.user.id)}
        className={`font-semibold text-xs px-4 py-1.5 rounded-lg ml-auto transition-colors ${
          isFollowing ? 'bg-gray-200 text-gray-700' : 'bg-primary text-white'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  } else if (activity.relatedEvent) {
    actionButton = (
      <button
        onClick={() => onToggleJoin(activity.relatedEvent!.id)}
        className={`font-semibold text-xs px-4 py-1.5 rounded-lg ml-auto transition-colors ${
          isJoined ? 'bg-gray-200 text-gray-700' : 'bg-primary/10 text-primary'
        }`}
      >
        {isJoined ? 'Joined' : 'Join'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 py-3">
      <img src={activity.user.avatarUrl} alt={activity.user.name} className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold">{activity.user.name}</span>
          <span className="text-gray-600"> {activity.details}</span>
        </p>
        <p className="text-xs text-gray-400">{activity.timestamp}</p>
      </div>
      {activity.relatedImageUrl && (
        <img src={activity.relatedImageUrl} className="w-12 h-12 rounded-lg object-cover" />
      )}
      {actionButton}
    </div>
  );
};

const FILTERS = ['All', 'Sports', 'Drinks', 'Music', 'Outdoors', 'Arts', 'Food'];

const FilterButton: React.FC<{ label: string; isActive?: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
  >
    {label}
  </button>
);

const ActivitiesScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [followedUserIds, setFollowedUserIds] = useState<Set<number>>(new Set());
  const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());

  const toggleFollow = (userId: number) => {
    setFollowedUserIds(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const toggleJoin = (eventId: number) => {
    setJoinedEventIds(prev => {
      const next = new Set(prev);
      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
      return next;
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="p-4">
        <div className="flex space-x-2">
          {FILTERS.map(f => (
            <FilterButton key={f} label={f} isActive={activeFilter === f} onClick={() => setActiveFilter(f)} />
          ))}
        </div>
        {(() => {
          const filtered = MOCK_ACTIVITIES.filter(activity => {
            if (activeFilter === 'All') return true;
            const keyword = activeFilter.toLowerCase();
            return (
              activity.details.toLowerCase().includes(keyword) ||
              activity.relatedEvent?.title.toLowerCase().includes(keyword) ||
              activity.relatedEvent?.category.toLowerCase().includes(keyword)
            );
          });
          return (
            <div className="mt-4 divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">No activity for "{activeFilter}"</p>
              ) : filtered.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isFollowing={followedUserIds.has(activity.user.id)}
                  isJoined={activity.relatedEvent ? joinedEventIds.has(activity.relatedEvent.id) : false}
                  onToggleFollow={toggleFollow}
                  onToggleJoin={toggleJoin}
                />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ActivitiesScreen;
