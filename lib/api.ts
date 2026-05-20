import { supabase } from './supabase';
import { Event, User, Message, Category } from '../types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop';

function dbRowToEvent(row: any): Event {
  const p = row.profiles;
  const organizer: User = {
    id: row.creator_id,
    name: p?.full_name ?? 'Unknown',
    username: p?.username ?? '',
    age: p?.age ?? 0,
    city: p?.city ?? '',
    bio: p?.bio ?? '',
    interests: p?.interests ?? [],
    avatarUrl: p?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.full_name ?? 'User')}&background=7B4FFF&color=fff`,
  };
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url ?? DEFAULT_IMAGE,
    date: row.event_date,
    location: row.location,
    lat: row.lat ?? 37.779,
    lng: row.lng ?? -122.419,
    organizer,
    attendeeIds: (row.event_attendees ?? []).map((a: any) => a.user_id),
    maxParticipants: row.max_people ?? 10,
    category: row.category as Category,
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, profiles!creator_id(full_name, avatar_url, age, city, bio, interests), event_attendees(user_id)')
    .order('event_date', { ascending: true });
  if (error) { console.error('fetchEvents:', error); return []; }
  return (data ?? []).map(dbRowToEvent);
}

export async function createEvent(
  currentUser: User,
  eventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>
): Promise<Event | null> {
  const { data: row, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      description: eventData.description,
      image_url: eventData.imageUrl,
      event_date: eventData.date,
      location: eventData.location,
      lat: eventData.lat,
      lng: eventData.lng,
      creator_id: currentUser.id,
      max_people: eventData.maxParticipants,
      category: eventData.category,
    })
    .select()
    .single();
  if (error || !row) { console.error('createEvent:', error); return null; }

  // Auto-join as organizer
  await supabase.from('event_attendees').insert({ event_id: row.id, user_id: currentUser.id });

  return { ...eventData, id: row.id, organizer: currentUser, attendeeIds: [currentUser.id] };
}

export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('event_attendees').insert({ event_id: eventId, user_id: userId });
  if (error) console.error('joinEvent:', error);
}

export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
  if (error) console.error('leaveEvent:', error);
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) console.error('deleteEvent:', error);
}

export async function fetchProfiles(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];
  const { data } = await supabase.from('profiles').select('*').in('id', userIds);
  return (data ?? []).map(p => ({
    id: p.id,
    name: p.full_name || p.name || '',
    username: p.username ?? '',
    age: p.age ?? 0,
    city: p.city ?? 'Madrid',
    bio: p.bio ?? '',
    interests: p.interests ?? [],
    avatarUrl: p.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}&background=7B4FFF&color=fff`,
  }));
}

export async function fetchMessages(eventId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('event_messages')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchMessages:', error); return []; }
  return (data ?? []).map(row => ({
    id: row.id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: row.created_at,
  }));
}

export async function sendMessage(eventId: string, senderId: string, text: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('event_messages')
    .insert({ event_id: eventId, sender_id: senderId, text })
    .select()
    .single();
  if (error) { console.error('sendMessage:', error); return null; }
  return { id: data.id, senderId: data.sender_id, text: data.text, timestamp: data.created_at };
}
