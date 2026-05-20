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

    // Try sign in first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError) {
      onLogin();
      return;
    }

    const isInvalidCreds = signInError.message.toLowerCase().includes('invalid') || signInError.message.toLowerCase().includes('credentials');

    if (isInvalidCreds) {
      // Try creating a new account — if this also fails, the email exists with a different password
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (!signUpError) {
        onLogin();
        return;
      }
      // Email already registered but password is wrong
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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setEmailError('Google sign-in is not set up yet. Use email and password below.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans">
      <header className="flex-shrink-0 py-4">
        {step === 'password' && (
          <button onClick={() => { setStep('email'); setPasswordError(''); }} className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="Circl" className="mx-auto object-contain drop-shadow-sm" style={{ width: '85vw', maxWidth: '320px' }} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {step === 'email' ? 'Sign in or create account' : 'Enter your password'}
          </h2>
          <p className="text-gray-500 mt-1">
            {step === 'email' ? 'Enter your email to continue' : email}
          </p>

          {step === 'email' ? (
            <>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleContinue()}
                placeholder="email@domain.com"
                className={`w-full mt-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${emailError ? 'border-red-400' : 'border-gray-300'}`}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </>
          ) : (
            <div className="mt-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleContinue()}
                  placeholder="Password (min 6 characters)"
                  autoFocus
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${passwordError ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg mt-4 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : 'Continue'}
          </button>
        </div>

        {step === 'email' && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <div className="space-y-3">
              <button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-gray-50 flex items-center justify-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
              <button onClick={handleContinue} className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 814 1000">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-167.8-107.8c-72.3-80-133-207.5-133-330.5 0-194.8 127.4-298.1 253.4-298.1 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                </svg>
                Continue with Apple
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="flex-shrink-0 text-center mt-8">
        <p className="text-xs text-gray-400">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline">Terms of Service</a> and{' '}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
