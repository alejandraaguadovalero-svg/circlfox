import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../lib/i18n';

interface LoginScreenProps {
  onLogin: () => void;
  onSignup: (userId: string, email: string) => void;
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

const LegalModal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40" />
    <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg font-bold">×</button>
      </div>
      <div className="overflow-y-auto px-6 py-4 text-sm text-gray-600 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup }) => {
  const { t, lang } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setEmailError('');
    setPasswordError('');
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([promise, new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your connection.')), ms))]);

  const validate = () => {
    if (!email || !email.includes('@')) { setEmailError(t.email_invalid); return false; }
    if (password.length < 6) { setPasswordError(t.password_short); return false; }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setEmailError(''); setPasswordError('');
    try {
      const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 25000);
      if (!error && data.user) {
        if (!data.user.email_confirmed_at) {
          onSignup(data.user.id, email);
          return;
        }
        onLogin();
        return;
      }
      const msg = error?.message.toLowerCase() ?? '';
      if (msg.includes('email not confirmed')) {
        setEmailError(t.email_not_confirmed);
      } else if (msg.includes('invalid') || msg.includes('credentials')) {
        setPasswordError(t.password_wrong);
      } else {
        setPasswordError(error?.message ?? '');
      }
    } catch (e: any) {
      setPasswordError(e.message);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    setEmailError(''); setPasswordError('');
    try {
      const { data, error } = await withTimeout(supabase.auth.signUp({ email, password }), 25000);
      if (!error && data?.user) {
        onSignup(data.user.id, email);
        return;
      }
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          setEmailError(t.account_exists);
        } else {
          setEmailError(error.message);
        }
      }
    } catch (e: any) {
      setEmailError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col font-sans bg-cream">
      <header className="px-6 pt-12 pb-2 flex-shrink-0" />

      <main className="flex-grow flex flex-col justify-center px-6 -mt-8">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Kruh" className="mx-auto object-contain" style={{ width: '60vw', maxWidth: '240px' }} />
        </div>

        {/* Toggle */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-black/5">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}
          >
            {t.login_tab}
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${mode === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}
          >
            {t.signup_tab}
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {mode === 'login' ? t.login_title : t.signup_title}
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            {mode === 'login' ? t.login_sub : t.signup_sub}
          </p>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignUp())}
            placeholder={t.email_placeholder}
            className={`w-full px-4 py-4 border-2 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary transition-colors ${emailError ? 'border-red-300' : 'border-transparent'}`}
          />
          {emailError && <p className="text-red-500 text-xs mt-1.5 mb-2">{emailError}</p>}

          {/* Password */}
          <div className="relative mt-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignUp())}
              placeholder={mode === 'signup' ? t.password_new_placeholder : t.password_placeholder}
              className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary transition-colors ${passwordError ? 'border-red-300' : 'border-transparent'}`}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <EyeIcon show={showPassword} />
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs mt-1.5">{passwordError}</p>}

          <button
            onClick={mode === 'login' ? handleLogin : handleSignUp}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl mt-4 active:scale-95 transition-transform duration-150 disabled:opacity-50"
          >
            {loading ? t.loading : mode === 'login' ? t.login_btn : t.signup_btn}
          </button>
        </div>
      </main>

      <footer className="flex-shrink-0 text-center px-6 pb-10">
        <p className="text-xs text-gray-400">
          {t.terms_agree}{' '}
          <button onClick={() => setShowTerms(true)} className="text-gray-500 underline underline-offset-2">{t.terms_link}</button>
          {' '}{lang === 'es' ? 'y' : 'and'}{' '}
          <button onClick={() => setShowPrivacy(true)} className="text-gray-500 underline underline-offset-2">{t.privacy_link}</button>
        </p>
      </footer>

      {showTerms && (
        <LegalModal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <p><strong>Last updated: May 2026</strong></p>
          <p>Welcome to Kruh. By creating an account, you agree to these terms.</p>
          <p><strong>1. Eligibility</strong><br />You must be between 17 and 32 years old to use Kruh. By signing up, you confirm this is true.</p>
          <p><strong>2. Your account</strong><br />You are responsible for keeping your account secure. Use a strong password and don't share your credentials.</p>
          <p><strong>3. Acceptable use</strong><br />Kruh is for meeting people and organising social events. You agree not to post false events, harass other users, or use the app for commercial purposes.</p>
          <p><strong>4. Events</strong><br />Event organisers are responsible for the events they create. Kruh is not liable for anything that happens at events organised through the platform.</p>
          <p><strong>5. Content</strong><br />By uploading photos or text, you grant Kruh a licence to display that content within the app. We will never sell your content to third parties.</p>
          <p><strong>6. Termination</strong><br />We reserve the right to suspend or delete accounts that violate these terms.</p>
          <p><strong>7. Changes</strong><br />We may update these terms. Continued use of Kruh after changes means you accept the new terms.</p>
          <p>Questions? Contact us at hello@kruh.app</p>
        </LegalModal>
      )}

      {showPrivacy && (
        <LegalModal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <p><strong>Last updated: May 2026</strong></p>
          <p>Kruh takes your privacy seriously. Here's what we collect and why.</p>
          <p><strong>What we collect</strong><br />Name, email address, date of birth, profile photo, interests, and the events you create or join.</p>
          <p><strong>Why we collect it</strong><br />To create your profile, show you relevant events, and allow other users to connect with you.</p>
          <p><strong>Who can see your data</strong><br />Your name, photo, and interests are visible to other Kruh users. Your email and date of birth are never shown publicly.</p>
          <p><strong>Third parties</strong><br />We use Supabase to store data securely. We do not sell your data to advertisers or third parties.</p>
          <p><strong>Location</strong><br />We use the location you enter when creating events. We do not track your device's GPS location.</p>
          <p><strong>Your rights</strong><br />You can delete your account and all associated data at any time from your profile settings.</p>
          <p><strong>Cookies</strong><br />We use only essential cookies required for authentication. No tracking or advertising cookies.</p>
          <p>Questions? Contact us at hello@kruh.app</p>
        </LegalModal>
      )}
    </div>
  );
};

export default LoginScreen;
