import React, { useState, useEffect, useRef } from 'react';
import { Category, Event } from '../../types';
import { supabase } from '../../lib/supabase';

interface CreateEventScreenProps {
  onCreateEvent: (eventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => void;
  onCancel: () => void;
}

const CATEGORY_EMOJIS: Record<Category, string> = {
  [Category.SPORTS]: '⚽',
  [Category.DRINKS]: '🍹',
  [Category.ARTS]: '🎨',
  [Category.STUDY]: '📚',
  [Category.FOOD]: '🍜',
  [Category.MUSIC]: '🎵',
  [Category.OUTDOORS]: '🌿',
  [Category.OTHER]: '✨',
};

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ onCreateEvent, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.SPORTS);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number }>({ lat: 40.4168, lng: -3.7038 });
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventType, setEventType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!location.trim() || location.length < 3) { setSuggestions([]); return; }
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=5&countrycodes=es&viewbox=-4.6,40.7,-3.1,40.1&bounded=0&accept-language=es,en`,
          { headers: { 'Accept-Language': 'es,en' } }
        );
        const data: LocationSuggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 400);
  }, [location]);

  const selectSuggestion = (s: LocationSuggestion) => {
    const parts = s.display_name.split(',');
    setLocation(parts.slice(0, 2).join(',').trim());
    setLocationCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('event-images').upload(path, file);
    if (error || !data) {
      alert(`Upload failed: ${error?.message ?? 'unknown error'}.`);
      setUploadingImage(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(data.path);
    setUploadedImageUrl(publicUrl);
    setUploadingImage(false);
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Event title is required.');
    if (!location.trim()) errs.push('Location is required.');
    if (!description.trim()) errs.push('Description is required.');
    if (category === Category.OTHER && !eventType.trim()) errs.push('Please describe your event type.');
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setShowSuccess(true);
    setTimeout(() => {
      onCreateEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: new Date(date).toISOString(),
        maxParticipants,
        category,
        imageUrl: uploadedImageUrl ?? '',
        lat: locationCoords.lat,
        lng: locationCoords.lng,
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <header className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex items-center">
        <button onClick={onCancel}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-secondary mx-auto">Create Event</h1>
        <button onClick={handleSubmit} className="text-primary font-bold text-sm">Publish</button>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Category */}
        <div className="px-4 pt-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                <span>{CATEGORY_EMOJIS[cat]}</span><span>{cat}</span>
              </button>
            ))}
          </div>
          {category === Category.OTHER && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Briefly describe what kind of event this is</p>
              <input type="text" value={eventType} onChange={e => setEventType(e.target.value)}
                placeholder="e.g. Board games, Language exchange, Dog walk..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-300" />
            </div>
          )}
        </div>

        {/* Event Image */}
        <div className="px-4 mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Event Image</p>
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full h-44 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 overflow-hidden relative">
            {uploadingImage ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : uploadedImageUrl ? (
              <img src={uploadedImageUrl} alt="Event" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold text-gray-500">Add a photo</p>
                <p className="text-xs text-gray-400">Tap to choose from your camera roll</p>
              </>
            )}
          </button>
          {uploadedImageUrl && (
            <button onClick={() => setUploadedImageUrl(null)} className="mt-2 text-xs text-red-400 font-medium">Remove photo</button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Form fields */}
        <div className="px-4 mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</p>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex-shrink-0">Title</span>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Give your event a name"
              className="text-right text-gray-600 focus:outline-none bg-transparent flex-1 ml-4 placeholder-gray-300" />
          </div>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex-shrink-0">Date & Time</span>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
              className="text-right text-gray-600 focus:outline-none bg-transparent text-sm" />
          </div>

          {/* Location with autocomplete */}
          <div className="border-b border-gray-100 py-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 flex-shrink-0">Location</span>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search in Madrid..."
                className="text-right text-gray-600 focus:outline-none bg-transparent flex-1 ml-4 placeholder-gray-300" />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full bg-white rounded-xl shadow-lg border border-gray-100 z-20 mt-1 overflow-hidden">
                {suggestions.map((s, i) => {
                  const parts = s.display_name.split(',');
                  return (
                    <button key={i} onMouseDown={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{parts[0].trim()}</p>
                      <p className="text-xs text-gray-400 truncate">{parts.slice(1, 3).join(',').trim()}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Max Attendees stepper */}
          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Max Attendees</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setMaxParticipants(v => Math.max(2, v - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg leading-none">−</button>
              <span className="text-gray-800 font-semibold w-6 text-center">{maxParticipants}</span>
              <button onClick={() => setMaxParticipants(v => Math.min(30, v + 1))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg leading-none">+</button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</p>
          <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 300))} rows={4}
            placeholder="Tell people what this event is about..."
            maxLength={300}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white placeholder-gray-300 resize-none" />
          <p className="text-xs text-gray-400 text-right mt-1">{description.length}/300</p>
        </div>

        {errors.length > 0 && (
          <div className="px-4 mt-3">
            {errors.map((e, i) => <p key={i} className="text-red-500 text-sm">{e}</p>)}
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-900">Event Created!</p>
            <p className="text-gray-500 text-sm">Your event is now live</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 pb-8 bg-white border-t">
        <button onClick={handleSubmit}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl text-base">
          Publish Event
        </button>
      </div>
    </div>
  );
};

export default CreateEventScreen;
