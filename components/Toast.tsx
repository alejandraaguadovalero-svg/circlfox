import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onDone: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, onDone, type = 'info' }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2500);
    return () => clearTimeout(t);
  }, []);

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-500' : 'bg-gray-900';

  return (
    <div className={`fixed top-safe-area-inset-top left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${visible ? 'top-6 opacity-100' : 'top-2 opacity-0'}`}
      style={{ top: visible ? '1.5rem' : '0.5rem' }}>
      <div className={`${bg} text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg max-w-xs text-center`}>
        {message}
      </div>
    </div>
  );
};

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const show = (message: string, type?: 'success' | 'error' | 'info') => setToast({ message, type });
  const node = toast ? <Toast key={toast.message + Date.now()} message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null;
  return { show, node };
}
