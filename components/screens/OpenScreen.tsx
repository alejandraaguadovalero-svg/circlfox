import React from 'react';
import { useLanguage } from '../../lib/i18n';

interface OpenScreenProps {
  onEnter: () => void;
}

const OpenScreen: React.FC<OpenScreenProps> = ({ onEnter }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col px-8 font-sans bg-primary">
      <div className="pt-16 flex justify-center">
        <div className="w-8 h-1 rounded-full bg-primary opacity-80" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <img src="/logo.png" alt="Kruh" style={{ width: '75vw', maxWidth: '300px' }} className="object-contain" />
        <div className="text-center">
          <p className="text-white/50 text-sm font-medium tracking-wide uppercase">{t.open_location}</p>
          <p className="text-white/80 text-lg font-medium mt-2 leading-relaxed">
            {t.open_tagline.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </p>
        </div>
      </div>

      <div className="pb-14 flex flex-col items-center gap-3">
        <button
          onClick={onEnter}
          className="w-full max-w-sm bg-white text-primary font-bold py-4 px-6 rounded-2xl text-base active:scale-95 transition-transform duration-150"
        >
          {t.open_cta}
        </button>
        <p className="text-white/50 text-xs">{t.open_sub}</p>
      </div>
    </div>
  );
};

export default OpenScreen;
