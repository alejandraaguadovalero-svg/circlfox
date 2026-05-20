import React, { useState, useCallback, useEffect } from 'react';
import { Event, User, Message } from './types';
import { MOCK_EVENTS, MOCK_USERS, MOCK_EVENT_MESSAGES } from './constants';
import HomeScreen from './components/screens/HomeScreen';
import EventDetailScreen from './components/screens/EventDetailScreen';
import CreateEventScreen from './components/screens/CreateEventScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import BookingsScreen from './components/screens/BookingsScreen';
import ActivitiesScreen from './components/screens/ActivitiesScreen';
import ChatListScreen from './components/screens/ChatListScreen';
import ChatDetailScreen from './components/screens/ChatDetailScreen';
import UserProfileModal from './components/UserProfileModal';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/screens/LoginScreen';
import OpenScreen from './components/screens/OpenScreen';
import ProfileSetupScreen from './components/screens/ProfileSetupScreen';
import { supabase } from './lib/supabase';

type View = 'home' | 'create' | 'profile' | 'eventDetail' | 'bookings' | 'activities' | 'chat' | 'chatDetail';
type AppState = 'loading' | 'open' | 'login' | 'profile-setup' | 'main';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentView, setCurrentView] = useState<View>('home');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedChatEventId, setSelectedChatEventId] = useState<number | null>(null);
  const [viewBeforeDetail, setViewBeforeDetail] = useState<View>('home');
  const [eventMessages, setEventMessages] = useState<Record<number, Message[]>>(MOCK_EVENT_MESSAGES);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<number, string>>({});

  const applyProfile = useCallback((userId: string, profile: { full_name?: string; name?: string; age?: number | null; city?: string | null; bio?: string | null; interests?: string[] | null; avatar_url?: string | null }) => {
    const displayName = profile.full_name || profile.name || '';
    const user: User = {
      id: userId,
      name: displayName,
      age: profile.age ?? 0,
      city: profile.city ?? '',
      bio: profile.bio ?? '',
      interests: profile.interests ?? [],
      avatarUrl: profile.avatar_url ?? `https://i.pravatar.cc/150?u=${userId}`,
    };
    setCurrentUser(user);
    setUsers(prev => {
      const without = prev.filter(u => u.id !== userId);
      return [...without, user];
    });
    setAppState('main');
  }, []);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const displayName = profile?.full_name || profile?.name || '';
    if (profile && displayName.trim() !== '' && profile.age) {
      applyProfile(userId, profile);
    } else {
      setPendingUserId(userId);
      setPendingEmail(email ?? null);
      setAppState('profile-setup');
    }
  }, [applyProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setAppState('open');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUsers(MOCK_USERS);
        setAppState('login');
      } else if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id, session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const handleEnter = () => setAppState('login');
  const handleLogin = () => { /* auth state change listener handles the rest */ };
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileComplete = (user: User) => {
    setCurrentUser(user);
    setUsers(prev => {
      const without = prev.filter(u => u.id !== user.id);
      return [...without, user];
    });
    setPendingUserId(null);
    setPendingEmail(null);
    setAppState('main');
  };

  const handleCreateEvent = useCallback((newEventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => {
    if (!currentUser) return;
    const newEvent: Event = {
      ...newEventData,
      id: Math.max(...events.map(e => e.id)) + 1,
      organizer: currentUser,
      attendeeIds: [currentUser.id],
    };
    setEvents(prev => [newEvent, ...prev]);
    setCurrentView('home');
  }, [currentUser, events]);

  const handleJoinEvent = useCallback((eventId: number) => {
    if (!currentUser) return;
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId && !event.attendeeIds.includes(currentUser.id)
          ? { ...event, attendeeIds: [...event.attendeeIds, currentUser.id] }
          : event
      )
    );
  }, [currentUser]);

  const handleLeaveEvent = useCallback((eventId: number) => {
    if (!currentUser) return;
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, attendeeIds: event.attendeeIds.filter(id => id !== currentUser.id) }
          : event
      )
    );
  }, [currentUser]);

  const handleDeleteEvent = useCallback((eventId: number) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setCurrentView(viewBeforeDetail);
    setSelectedEventId(null);
  }, [viewBeforeDetail]);

  const handleSendMessage = useCallback((eventId: number, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setEventMessages(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] ?? []), newMessage],
    }));
  }, [currentUser]);

  const navigateToEventDetail = (eventId: number) => {
    setViewBeforeDetail(currentView);
    setSelectedEventId(eventId);
    setCurrentView('eventDetail');
  };

  const navigateBack = () => {
    setCurrentView(viewBeforeDetail);
    setSelectedEventId(null);
  };

  const navigateToChatDetail = (eventId: number) => {
    setSelectedChatEventId(eventId);
    setLastReadTimestamps(prev => ({ ...prev, [eventId]: new Date().toISOString() }));
    setCurrentView('chatDetail');
  };

  if (appState === 'loading') {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-primary flex items-center justify-center">
        <img src="/logo.png" alt="Circl" className="w-32 h-32 object-contain animate-pulse" />
      </div>
    );
  }

  if (appState === 'open') return <OpenScreen onEnter={handleEnter} />;
  if (appState === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (appState === 'profile-setup' && pendingUserId) {
    return (
      <ProfileSetupScreen
        userId={pendingUserId}
        emailHint={pendingEmail ?? undefined}
        onComplete={handleProfileComplete}
      />
    );
  }

  if (!currentUser) return null;

  const chatUnreadCount = events
    .filter(e => e.attendeeIds.includes(currentUser.id))
    .filter(event => {
      const msgs = eventMessages[event.id] ?? [];
      const lastRead = lastReadTimestamps[event.id];
      return msgs.some(m => m.senderId !== currentUser.id && (!lastRead || new Date(m.timestamp) > new Date(lastRead)));
    }).length;

  const renderContent = () => {
    if (currentView === 'eventDetail' && selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        return (
          <EventDetailScreen
            event={event}
            allUsers={users}
            currentUser={currentUser}
            onBack={navigateBack}
            onJoin={handleJoinEvent}
            onLeave={handleLeaveEvent}
            onDelete={handleDeleteEvent}
            onGoToChat={navigateToChatDetail}
            onSelectUser={setSelectedProfileUserId}
          />
        );
      }
    }

    if (currentView === 'chatDetail' && selectedChatEventId) {
      const event = events.find(e => e.id === selectedChatEventId);
      if (event) {
        return (
          <ChatDetailScreen
            event={event}
            currentUser={currentUser}
            allUsers={users}
            messages={eventMessages[selectedChatEventId] ?? []}
            onSendMessage={text => handleSendMessage(selectedChatEventId, text)}
            onBack={() => setCurrentView('chat')}
          />
        );
      }
    }

    switch (currentView) {
      case 'home':
        return <HomeScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onNavigateToMap={() => setCurrentView('bookings')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
      case 'create':
        return <CreateEventScreen onCreateEvent={handleCreateEvent} onCancel={() => setCurrentView('home')} />;
      case 'profile':
        return <ProfileScreen currentUser={currentUser} events={events} onLogout={handleLogout} />;
      case 'bookings':
        return <BookingsScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} />;
      case 'activities':
        return <ActivitiesScreen />;
      case 'chat':
        return <ChatListScreen events={events} currentUser={currentUser} eventMessages={eventMessages} onSelectChat={navigateToChatDetail} />;
      default:
        return <HomeScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onNavigateToMap={() => setCurrentView('bookings')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
    }
  };

  const selectedProfileUser = selectedProfileUserId ? users.find(u => u.id === selectedProfileUserId) : null;

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col font-sans">
      <main className="flex-grow">
        {renderContent()}
      </main>
      {currentView !== 'chatDetail' && (
        <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView as (view: 'home' | 'activities' | 'create' | 'chat' | 'profile') => void}
          badges={{ chat: chatUnreadCount }}
        />
      )}
      {selectedProfileUser && (
        <UserProfileModal
          user={selectedProfileUser}
          events={events}
          currentUser={currentUser}
          onClose={() => setSelectedProfileUserId(null)}
          onGoToChat={(eventId) => {
            setSelectedProfileUserId(null);
            navigateToChatDetail(eventId);
          }}
        />
      )}
    </div>
  );
};

export default App;
