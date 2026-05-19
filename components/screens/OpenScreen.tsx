import React from 'react';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between pb-12 pt-16 px-8 font-sans">
        <div className="flex-1 flex items-center justify-center">
            <img src="/logo.png" alt="Circl" style={{ width: '85vw', maxWidth: '340px' }} className="object-contain drop-shadow-2xl" />
        </div>
        <button
            onClick={onEnter}
            className="w-full max-w-sm bg-white text-primary font-bold py-4 px-4 rounded-2xl transition-transform duration-200 hover:scale-105"
        >
            Enter
        </button>
    </div>
  );
};

export default OpenScreen;
