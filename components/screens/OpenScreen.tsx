import React from 'react';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 font-sans">
        <div/>
        <div className="text-center">
            <img src="/logo.png" alt="Circl" className="w-48 h-48 mx-auto object-contain" />
        </div>
        <button
            onClick={onEnter}
            className="w-full max-w-sm bg-black text-white font-bold py-4 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
        >
            Enter
        </button>
    </div>
  );
};

export default OpenScreen;
