import React, { useState } from 'react';
import { Category, Event } from '../../types';

interface CreateEventScreenProps {
  onCreateEvent: (eventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => void;
  onCancel: () => void;
}

const CATEGORY_IMAGES: Record<Category, string[]> = {
  [Category.SPORTS]: [
    'https://images.unsplash.com/photo-1541625232279-d69a531a7248?q=80&w=400',
    'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400',
    'https://images.unsplash.com/photo-1559348331-57d345336c32?q=80&w=400',
  ],
  [Category.DRINKS]: [
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=400',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400',
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=400',
  ],
  [Category.ARTS]: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400',
    'https://images.unsplash.com/photo-1531913223931-b0d3198229ee?q=80&w=400',
  ],
  [Category.STUDY]: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=400',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400',
  ],
  [Category.FOOD]: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=400',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=400',
  ],
  [Category.MUSIC]: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400',
    'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=400',
  ],
  [Category.OUTDOORS]: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400',
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
};

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
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [selectedImage, setSelectedImage] = useState<string>(CATEGORY_IMAGES[Category.SPORTS][0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setSelectedImage(CATEGORY_IMAGES[cat][0]);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim() || !maxParticipants) {
      alert('Please fill out all fields.');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      onCreateEvent({
        title,
        description,
        location,
        date: new Date(date).toISOString(),
        maxParticipants: parseInt(maxParticipants, 10),
        category,
        imageUrl: selectedImage.replace('w=400', 'w=800'),
        lat: 45.0703,
        lng: 7.6869,
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Header */}
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
        {/* Category picker */}
        <div className="px-4 pt-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(Category).map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image picker */}
        <div className="px-4 mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Event Image</p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORY_IMAGES[category].map(url => (
              <button
                key={url}
                onClick={() => setSelectedImage(url)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === url ? 'border-primary scale-95' : 'border-transparent'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-40 object-cover rounded-xl mt-3"
            />
          )}
        </div>

        {/* Form fields */}
        <div className="px-4 mt-5 space-y-0">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</p>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Title</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your event a name"
              className="text-right text-gray-600 focus:outline-none bg-transparent flex-1 ml-4 placeholder-gray-300"
            />
          </div>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Date & Time</span>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-right text-gray-600 focus:outline-none bg-transparent text-sm"
            />
          </div>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Location</span>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Where is it?"
              className="text-right text-gray-600 focus:outline-none bg-transparent flex-1 ml-4 placeholder-gray-300"
            />
          </div>

          <div className="border-b border-gray-100 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Max Attendees</span>
            <input
              type="number"
              min="2"
              value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              className="text-right text-gray-600 focus:outline-none bg-transparent w-16"
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-4 mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell people what this event is about..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white placeholder-gray-300 resize-none"
          />
        </div>
      </div>

      {/* Success overlay */}
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

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-colors"
        >
          Create Event
        </button>
      </div>
    </div>
  );
};

export default CreateEventScreen;
