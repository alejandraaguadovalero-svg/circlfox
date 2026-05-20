import React, { useState } from 'react';
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

    const avatarUrl = `https://i.pravatar.cc/150?u=${userId}`;

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name.trim(),
        age: Number(age),
        city: city.trim() || null,
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
      city: city.trim(),
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

        <div className="grid grid-cols-2 gap-3">
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. London"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell others a bit about yourself..."
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/200</p>
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
