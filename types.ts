export interface User {
  id: string;
  name: string;
  username: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  avatarUrl: string;
  nationality?: string;
  spokenLanguages?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  endDate?: string;
  location: string;
  lat: number;
  lng: number;
  organizer: User;
  attendeeIds: string[];
  maxParticipants: number;
  category: Category;
  languages?: string[];
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


export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}
