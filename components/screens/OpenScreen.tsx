import React from 'react';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between pb-12 pt-16 px-8 font-sans overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #5D3BFF 0%, #7B4FFF 45%, #a855f7 100%)' }}>

      {/* Floating orbs */}
      <div className="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #c084fc, transparent 70%)' }} />
      <div className="absolute top-[20%] right-[-80px] w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f0abfc, transparent 70%)' }} />
      <div className="absolute bottom-[20%] left-[-40px] w-48 h-48 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
      <div className="absolute bottom-[-40px] right-[-20px] w-56 h-56 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #e879f9, transparent 70%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
        <img src="/logo.png" alt="Circl" style={{ width: '85vw', maxWidth: '340px' }} className="object-contain drop-shadow-2xl" />
        <p className="text-white/80 text-base font-medium text-center leading-relaxed">
          Move cities. Find your people.<br />Always have a Circl.
        </p>
      </div>

      <button
        onClick={onEnter}
        className="relative z-10 w-full max-w-sm font-bold py-4 px-4 rounded-2xl text-lg shadow-2xl transition-transform duration-200 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)', color: '#7B4FFF' }}
      >
        Find your Circl ✦
      </button>
    </div>
  );
};

export default OpenScreen;
