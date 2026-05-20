import React from 'react';
import { HomeIcon, UserCircleIcon, BellIcon, ChatIcon } from './icons';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'activities' | 'create' | 'chat' | 'profile') => void;
  badges?: Partial<Record<'home' | 'activities' | 'create' | 'chat' | 'profile', number>>;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView, badges = {} }) => {
  const sideItems = [
    { view: 'home', icon: HomeIcon, label: 'Home' },
    { view: 'activities', icon: BellIcon, label: 'Activity' },
    null, // center placeholder
    { view: 'chat', icon: ChatIcon, label: 'Chat' },
    { view: 'profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-md border-t border-black/5 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
        {sideItems.map((item, i) => {
          if (!item) {
            return (
              <button
                key="create"
                onClick={() => setCurrentView('create')}
                className="relative -top-4 flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg active:scale-95 transition-transform duration-150"
                aria-label="Start a Kruh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            );
          }

          const isSelected = currentView === item.view;
          const badgeCount = badges[item.view as keyof typeof badges] ?? 0;

          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view as 'home' | 'activities' | 'create' | 'chat' | 'profile')}
              className="flex flex-col items-center justify-center gap-0.5 w-full relative transition-all duration-200"
              aria-label={item.label}
            >
              <item.icon className={`w-6 h-6 transition-colors duration-200 ${isSelected ? 'text-primary' : 'text-gray-400'}`} isFilled={isSelected} />
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isSelected && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
              {badgeCount > 0 && (
                <span className="absolute top-0 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
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
