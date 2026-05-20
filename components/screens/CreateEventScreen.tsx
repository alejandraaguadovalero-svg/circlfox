import React, { useState, useEffect, useRef } from 'react';
import { Category, Event } from '../../types';
import { supabase } from '../../lib/supabase';

interface CreateEventScreenProps {
  onCreateEvent: (eventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => void;
  onCancel: () => void;
}

const CATEGORY_IMAGES: Record<Category, string[]> = {
  [Category.SPORTS]: [
    'https://images.unsplash.com/photo-1541625232279-d69a531a7248?q=80&w=800',
    'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
    'https://images.unsplash.com/photo-1559348331-57d345336c32?q=80&w=800',
  ],
  [Category.DRINKS]: [
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800',
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=800',
  ],
  [Category.ARTS]: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800',
    'https://images.unsplash.com/photo-1531913223931-b0d3198229ee?q=80&w=800',
  ],
  [Category.STUDY]: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
  ],
  [Category.FOOD]: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800',
  ],
  [Category.MUSIC]: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=800',
  ],
  [Category.OUTDOORS]: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800',
  ],
  [Category.OTHER]: [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800',
    'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=800',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800',
  ],
};

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
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [selectedImage, setSelectedImage] = useState<string>(CATEGORY_IMAGES[Category.SPORTS][0]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventType, setEventType] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!location.trim() || location.length < 3) {
      setSuggestions([]);
      return;
    }
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
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }, [location]);

  const selectSuggestion = (s: LocationSuggestion) => {
    // Show a short readable name instead of the full Nominatim string
    const parts = s.display_name.split(',');
    setLocation(parts.slice(0, 2).join(',').trim());
    setLocationCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    if (!uploadedImageUrl) setSelectedImage(CATEGORY_IMAGES[cat][0]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('event-images').upload(path, file);
    if (error || !data) {
      alert(`Upload failed: ${error?.message ?? 'unknown error'}. Please try a preset image instead.`);
      setUploadingImage(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(data.path);
    setUploadedImageUrl(publicUrl);
    setUploadingImage(false);
  };

  const currentImageUrl = uploadedImageUrl ?? selectedImage;

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Event title is required.');
    if (!location.trim()) errs.push('Location is required.');
    if (!description.trim()) errs.push('Description is required.');
    if (category === Category.OTHER && !eventType.trim()) errs.push('Please describe your event type.');
    const max = parseInt(maxParticipants, 10);
    if (isNaN(max) || max < 2 || max > 30) errs.push('Max attendees must be between 2 and 30.');
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setShowSuccess(true);
    setTimeout(() => {
      onCreateEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: new Date(date).toISOString(),
        maxParticipants: max,
        category,
        imageUrl: currentImageUrl,
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
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Category */}
        <div className="px-4 pt-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
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
          {/* Preset grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {CATEGORY_IMAGES[category].map(url => (
              <button key={url} onClick={() => { setSelectedImage(url); setUploadedImageUrl(null); }}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${!uploadedImageUrl && selectedImage === url ? 'border-primary scale-95' : 'border-transparent'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {/* Upload from camera roll */}
            <button onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${uploadedImageUrl ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'}`}>
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400 leading-tight text-center">Your photo</span>
                </>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          {/* Preview */}
          <img src={currentImageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
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
                  const name = parts[0].trim();
                  const sub = parts.slice(1, 3).join(',').trim();
                  return (
                    <button key={i} onMouseDown={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{sub}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex-shrink-0">Max Attendees</span>
            <div className="flex items-center gap-2">
              <input type="number" min="2" max="30" value={maxParticipants}
                onChange={e => {
                  const v = Math.min(30, Math.max(2, parseInt(e.target.value) || 2));
                  setMaxParticipants(v.toString());
                }}
                className="text-right text-gray-600 focus:outline-none bg-transparent w-16" />
              <span className="text-xs text-gray-400">/ 30</span>
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

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        <button onClick={handleSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-colors">
          Create Event
        </button>
      </div>
    </div>
  );
};

export default CreateEventScreen;
