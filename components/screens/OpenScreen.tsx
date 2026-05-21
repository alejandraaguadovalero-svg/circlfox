import React from 'react';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col px-8 font-sans bg-primary">

      {/* Top bar */}
      <div className="pt-16 flex justify-center">
        <div className="w-8 h-1 rounded-full bg-primary opacity-80" />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img
          src="/logo.png"
          alt="Kruh"
          style={{ width: '75vw', maxWidth: '300px' }}
          className="object-contain"
        />

        <div className="text-center">
          <p className="text-white/50 text-sm font-medium tracking-wide uppercase">Madrid · Social Events</p>
          <p className="text-white/80 text-lg font-medium mt-2 leading-relaxed">
            Move cities. Find your people.<br />Always have a Kruh.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="pb-14 flex flex-col items-center gap-3">
        <button
          onClick={onEnter}
          className="w-full max-w-sm bg-white text-primary font-bold py-4 px-6 rounded-2xl text-base active:scale-95 transition-transform duration-150"
        >
          Get started ✦
        </button>
        <p className="text-white/50 text-xs">Free · No ads · Just people</p>
      </div>
    </div>
  );
};

export default OpenScreen;
