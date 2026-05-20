import React from 'react';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between pb-12 pt-16 px-8 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <img src="/logo.png" alt="Circl" style={{ width: '85vw', maxWidth: '340px' }} className="object-contain drop-shadow-2xl" />
            <p className="text-white/70 text-base font-medium text-center">Move cities. Find your people.<br/>Always have a Circl.</p>
        </div>
        <button
            onClick={onEnter}
            className="w-full max-w-sm bg-white text-primary font-bold py-4 px-4 rounded-2xl text-lg shadow-xl transition-transform duration-200 active:scale-95"
        >
            Find your Circl ✦
        </button>
    </div>
  );
};

export default OpenScreen;
