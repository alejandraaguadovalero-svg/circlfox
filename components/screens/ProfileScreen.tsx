import React, { useState, useRef } from 'react';
import { User, Event } from '../../types';
import { MapPinIcon, ChartBarIcon, UsersIcon } from '../icons';
import { supabase } from '../../lib/supabase';

interface ProfileScreenProps {
  currentUser: User;
  events: Event[];
  onLogout: () => void;
}

const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Toggle: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SettingsRow: React.FC<{ label: string; enabled: boolean; onChange: () => void }> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
    <span className="text-gray-800 font-medium">{label}</span>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, events, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState({
    eventNotifications: true,
    messageNotifications: true,
    activityNotifications: false,
    privateProfile: false,
    showLocation: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${currentUser.id}/avatar.${ext}`;
    const { data } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (data) {
      const url = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
      setAvatarUrl(url);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', currentUser.id);
    }
    setUploadingAvatar(false);
  };

  const attendedEvents = events.filter(event => event.attendeeIds.includes(currentUser.id) && new Date(event.date) < new Date());
  const createdEvents = events.filter(event => event.organizer.id === currentUser.id);

  const nextEvent = events
    .filter(event => event.attendeeIds.includes(currentUser.id) && new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="w-6" />
        <h1 className="text-xl font-bold text-secondary">Circl</h1>
        <button onClick={() => setShowSettings(true)}>
          <GearIcon className="h-6 w-6 text-gray-500" />
        </button>
      </header>

      <div className="p-4">
        <div className="flex flex-col items-center text-center">
          <button onClick={() => fileInputRef.current?.click()} className="relative" disabled={uploadingAvatar}>
            <img src={avatarUrl} alt={currentUser.name} className="w-24 h-24 rounded-full shadow-lg object-cover" />
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow">
              {uploadingAvatar ? (
                <svg className="h-4 w-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <h2 className="text-2xl font-bold text-gray-800 mt-4">{currentUser.name}</h2>
          {currentUser.username && <p className="text-primary font-medium text-sm">@{currentUser.username}</p>}
          <p className="text-gray-500 mt-1">{currentUser.bio}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {currentUser.interests.map(interest => (
              <span key={interest} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg">{interest}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 text-center">
          <StatCard icon={<ChartBarIcon className="w-6 h-6 text-primary" />} label="Events Created" value={createdEvents.length.toString()} />
          <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} label="Events Attended" value={attendedEvents.length.toString()} />
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-2">Next Events</h3>
          {nextEvent ? (
            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
              <p className="font-semibold">{nextEvent.title}</p>
              <p className="text-sm text-gray-600">{new Date(nextEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-500">No upcoming events.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 px-4">
        <button onClick={onLogout} className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg">Log Out</button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowSettings(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-2xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notifications</p>
            <SettingsRow label="Event reminders" enabled={settings.eventNotifications} onChange={() => toggle('eventNotifications')} />
            <SettingsRow label="New messages" enabled={settings.messageNotifications} onChange={() => toggle('messageNotifications')} />
            <SettingsRow label="Activity & mentions" enabled={settings.activityNotifications} onChange={() => toggle('activityNotifications')} />

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-6 mb-2">Privacy</p>
            <SettingsRow label="Private profile" enabled={settings.privateProfile} onChange={() => toggle('privateProfile')} />
            <SettingsRow label="Show my location" enabled={settings.showLocation} onChange={() => toggle('showLocation')} />

            <button onClick={() => setShowSettings(false)} className="w-full mt-6 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center justify-center gap-2">
      {icon}
      <span className="font-semibold text-gray-700 text-sm">{label}</span>
    </div>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default ProfileScreen;
