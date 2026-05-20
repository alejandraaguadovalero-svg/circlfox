import React from 'react';
import { HomeIcon, PlusCircleIcon, UserCircleIcon, BellIcon, ChatIcon } from './icons';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'activities' | 'create' | 'chat' | 'profile') => void;
  badges?: Partial<Record<'home' | 'activities' | 'create' | 'chat' | 'profile', number>>;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, badges = {} }) => {
  const navItems = [
    { view: 'home', icon: HomeIcon, label: 'Home' },
    { view: 'activities', icon: BellIcon, label: 'Activity' },
    { view: 'create', icon: PlusCircleIcon, label: 'Create' },
    { view: 'chat', icon: ChatIcon, label: 'Messages' },
    { view: 'profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isSelected = currentView === item.view;
          const badgeCount = badges[item.view as keyof typeof badges] ?? 0;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view as 'home' | 'bookings' | 'create' | 'chat' | 'profile')}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-200 relative ${
                isSelected ? 'text-primary' : 'text-gray-400'
              }`}
              aria-label={item.label}
            >
              <item.icon className="w-7 h-7" isFilled={isSelected} />
              {badgeCount > 0 && (
                <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
