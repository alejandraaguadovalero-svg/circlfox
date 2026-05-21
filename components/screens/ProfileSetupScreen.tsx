import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { useLanguage, NATIONALITIES, LANGUAGE_OPTIONS } from '../../lib/i18n';

interface ProfileSetupScreenProps {
  userId: string;
  emailHint?: string;
  onComplete: (user: User) => void;
}

const INTEREST_OPTIONS = ['Running', 'Football', 'Coffee', 'Music', 'Art', 'Travel', 'Gaming', 'Hiking', 'Cooking', 'Clubbing', 'Board Games', 'Photography'];

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ userId, emailHint, onComplete }) => {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState(emailHint?.split('@')[0] ?? '');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const MAX_LANGUAGES = 4;

  const calcAge = (dobStr: string): number => {
    const birth = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleInterest = (interest: string) =>
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);

  const toggleLanguage = (lang: string) => {
    setSpokenLanguages(prev => {
      if (prev.includes(lang)) return prev.filter(l => l !== lang);
      if (prev.length >= MAX_LANGUAGES) return prev;
      return [...prev, lang];
    });
  };

  const filteredNationalities = NATIONALITIES.filter(n =>
    n.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!firstName.trim()) { setError(t.setup_firstname_required); return; }
    if (!lastName.trim()) { setError(t.setup_lastname_required); return; }
    if (!username.trim()) { setError(t.setup_username_required); return; }
    if (username.includes(' ')) { setError(t.setup_username_spaces); return; }
    if (!dob) { setError(t.setup_dob_required); return; }
    const age = calcAge(dob);
    if (age < 17) { setError(t.setup_age_min); return; }
    if (age > 32) { setError(t.setup_age_max); return; }

    setLoading(true);
    setError('');

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=7B4FFF&color=fff&size=150`;

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { data: uploadData } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (uploadData) {
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl;
      }
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim().toLowerCase(),
        age,
        city: 'Madrid',
        bio: bio.trim() || null,
        interests,
        avatar_url: avatarUrl,
        nationality: nationality || null,
        spoken_languages: spokenLanguages,
      });

    if (dbError) {
      if (dbError.message.includes('unique') || dbError.message.includes('duplicate')) {
        setError(t.setup_username_taken);
      } else {
        setError(dbError.message);
      }
      setLoading(false);
      return;
    }

    onComplete({
      id: userId,
      name: fullName,
      username: username.trim().toLowerCase(),
      age,
      city: 'Madrid',
      bio: bio.trim(),
      interests,
      avatarUrl,
      nationality: nationality || undefined,
      spokenLanguages,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="px-6 pt-10 pb-4">
        <img src="/logo.png" alt="Kruh" className="w-12 h-12 object-contain mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">{t.setup_title}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t.setup_sub}</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
        {/* Avatar picker */}
        <div className="flex flex-col items-center py-2">
          <button onClick={() => fileInputRef.current?.click()} className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <p className="text-xs text-gray-400 mt-2">{t.setup_photo}</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_firstname} *</label>
            <input
              type="text"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setError(''); }}
              placeholder="e.g. María"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_lastname} *</label>
            <input
              type="text"
              value={lastName}
              onChange={e => { setLastName(e.target.value); setError(''); }}
              placeholder="e.g. García"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_username} *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value.replace(/\s/g, '').toLowerCase()); setError(''); }}
              placeholder="yourhandle"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_dob} *</label>
          <input
            type="date"
            value={dob}
            onChange={e => { setDob(e.target.value); setError(''); }}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 32)).toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Nationality */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_nationality}</label>
          <div
            className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            onClick={() => setShowNationalityDropdown(v => !v)}
          >
            <span className={nationality ? 'text-gray-800' : 'text-gray-400'}>
              {nationality || t.setup_nationality_placeholder}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {showNationalityDropdown && (
            <div className="absolute left-0 right-0 top-full z-30 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  autoFocus
                  value={nationalitySearch}
                  onChange={e => setNationalitySearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredNationalities.map(n => (
                  <button
                    key={n}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${nationality === n ? 'text-primary font-semibold' : 'text-gray-700'}`}
                    onMouseDown={() => { setNationality(n); setShowNationalityDropdown(false); setNationalitySearch(''); }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.setup_bio}</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder={t.setup_bio_placeholder}
            rows={3}
            maxLength={150}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/150</p>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.setup_interests}</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  interests.includes(interest) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Spoken languages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">{t.setup_languages}</label>
            <span className={`text-xs font-semibold ${spokenLanguages.length >= MAX_LANGUAGES ? 'text-accent' : 'text-gray-400'}`}>
              {spokenLanguages.length}/{MAX_LANGUAGES}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map(lang => {
              const selected = spokenLanguages.includes(lang.value);
              const atMax = spokenLanguages.length >= MAX_LANGUAGES && !selected;
              return (
                <button
                  key={lang.value}
                  onClick={() => toggleLanguage(lang.value)}
                  disabled={atMax}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-primary text-white'
                      : atMax
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                  {selected && <span className="ml-0.5 opacity-70 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
          {spokenLanguages.length >= MAX_LANGUAGES && (
            <p className="text-xs text-gray-400 mt-2">Max {MAX_LANGUAGES} languages. Tap a selected one to remove it.</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl disabled:opacity-60"
        >
          {loading ? t.setup_creating : t.setup_btn}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
