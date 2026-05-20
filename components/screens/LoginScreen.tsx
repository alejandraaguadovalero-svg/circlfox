import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginScreenProps {
  onLogin: () => void;
}

const EyeIcon: React.FC<{ show: boolean }> = ({ show }) => show ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (step === 'email') {
      if (!email || !email.includes('@')) { setEmailError('Please enter a valid email.'); return; }
      setEmailError('');
      setStep('password');
      return;
    }

    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    setPasswordError('');
    setLoading(true);

    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check your connection.')), ms))]);

    let signInError: any;
    try {
      const result = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 25000);
      signInError = result.error;
    } catch (e: any) {
      setPasswordError(e.message);
      setLoading(false);
      return;
    }

    if (!signInError) { onLogin(); return; }

    const isInvalidCreds = signInError.message.toLowerCase().includes('invalid') || signInError.message.toLowerCase().includes('credentials');

    if (isInvalidCreds) {
      let signUpData: any, signUpError: any;
      try {
        const result = await withTimeout(supabase.auth.signUp({ email, password }), 25000);
        signUpData = result.data; signUpError = result.error;
      } catch (e: any) {
        setPasswordError(e.message); setLoading(false); return;
      }
      if (!signUpError && signUpData?.user) {
        await supabase.from('profiles').upsert({ id: signUpData.user.id, full_name: email.split('@')[0] }, { onConflict: 'id' });
        onLogin();
        return;
      }
      if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('already exists')) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setPasswordError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    setPasswordError(signInError.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cream">

      <header className="px-6 pt-12 pb-2 flex-shrink-0 flex items-center">
        {step === 'password' ? (
          <button onClick={() => { setStep('email'); setPasswordError(''); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-black/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : <div className="w-9" />}
      </header>

      <main className="flex-grow flex flex-col justify-center px-6 -mt-8">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Kruh" className="mx-auto object-contain" style={{ width: '60vw', maxWidth: '240px' }} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">
          {step === 'email' ? 'Welcome back' : 'Enter password'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {step === 'email' ? 'New here? We\'ll create your account automatically.' : email}
        </p>

        {step === 'email' ? (
          <>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              placeholder="your@email.com"
              className={`w-full px-4 py-4 border-2 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary transition-colors ${emailError ? 'border-red-300' : 'border-transparent'}`}
            />
            {emailError && <p className="text-red-500 text-xs mt-2">{emailError}</p>}
          </>
        ) : (
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleContinue()}
                placeholder="Password (min 6 chars)"
                autoFocus
                className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary transition-colors ${passwordError ? 'border-red-300' : 'border-transparent'}`}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <EyeIcon show={showPassword} />
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-xs mt-2">{passwordError}</p>}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-4 active:scale-95 transition-transform duration-150 disabled:opacity-50"
        >
          {loading ? 'Please wait…' : step === 'email' ? 'Continue' : 'Let me in'}
        </button>
      </main>

      <footer className="flex-shrink-0 text-center px-6 pb-10">
        <p className="text-xs text-gray-400">
          By continuing you agree to our{' '}
          <a href="#" className="text-gray-500 underline underline-offset-2">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-gray-500 underline underline-offset-2">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
