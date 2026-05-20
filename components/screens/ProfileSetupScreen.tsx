import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';

interface ProfileSetupScreenProps {
  userId: string;
  emailHint?: string;
  onComplete: (user: User) => void;
}

const INTEREST_OPTIONS = ['Running', 'Football', 'Coffee', 'Music', 'Art', 'Travel', 'Gaming', 'Hiking', 'Cooking', 'Clubbing', 'Board Games', 'Photography'];

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ userId, emailHint, onComplete }) => {
  const [name, setName] = useState(emailHint?.split('@')[0] ?? '');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
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

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!age || isNaN(Number(age)) || Number(age) < 13 || Number(age) > 120) {
      setError('Please enter a valid age.'); return;
    }

    setLoading(true);
    setError('');

    let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=7B4FFF&color=fff&size=150`;
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
        full_name: name.trim(),
        age: Number(age),
        city: 'Madrid',
        bio: bio.trim() || null,
        interests,
        avatar_url: avatarUrl,
      });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    onComplete({
      id: userId,
      name: name.trim(),
      age: Number(age),
      city: 'Madrid',
      bio: bio.trim(),
      interests,
      avatarUrl,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="px-6 pt-10 pb-4">
        <img src="/logo.png" alt="Circl" className="w-12 h-12 object-contain mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Let others know who you are</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
        {/* Avatar picker */}
        <div className="flex flex-col items-center py-2">
          <button onClick={() => fileInputRef.current?.click()} className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
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
          <p className="text-xs text-gray-400 mt-2">Tap to add a photo</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Your name or username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
          <input
            type="number"
            value={age}
            onChange={e => { setAge(e.target.value); setError(''); }}
            placeholder="e.g. 22"
            min="13"
            max="120"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell others a bit about yourself..."
            rows={3}
            maxLength={150}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/150</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  interests.includes(interest)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
