import React from 'react';
import { HomeIcon, PlusCircleIcon, UserCircleIcon, MapIcon, ChatIcon } from './icons';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: 'home' | 'bookings' | 'create' | 'chat' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: 'home', icon: HomeIcon, label: 'Home' },
    { view: 'bookings', icon: MapIcon, label: 'Explore' },
    { view: 'create', icon: PlusCircleIcon, label: 'Create' },
    { view: 'chat', icon: ChatIcon, label: 'Messages' },
    { view: 'profile', icon: UserCircleIcon, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isSelected = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view as 'home' | 'bookings' | 'create' | 'chat' | 'profile')}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isSelected ? 'text-primary' : 'text-gray-400'
              }`}
              aria-label={item.label}
            >
              <item.icon className="w-7 h-7" isFilled={isSelected} />
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default BottomNav;