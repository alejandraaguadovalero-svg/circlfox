export interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  avatarUrl: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  organizer: User;
  attendeeIds: string[];
  maxParticipants: number;
  category: Category;
}

export enum Category {
  SPORTS = 'Sports',
  DRINKS = 'Drinks',
  ARTS = 'Arts',
  STUDY = 'Study Sessions',
  FOOD = 'Food',
  MUSIC = 'Music',
  OUTDOORS = 'Outdoors',
  OTHER = 'Other',
}

export enum ActivityType {
  FOLLOW = 'follow',
  NEW_EVENT = 'new_event',
  REPLY = 'reply',
  IMAGE_SHARE = 'image_share',
  SAVE = 'save',
  LIKE = 'like',
}

export interface Activity {
  id: number;
  type: ActivityType;
  user: User;
  timestamp: string;
  details: string;
  relatedImageUrl?: string;
  relatedEvent?: Event;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}
