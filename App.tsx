import React, { useState, useCallback, useEffect } from 'react';
import { Event, User, Message } from './types';

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
import { fetchEvents, createEvent, joinEvent, leaveEvent, deleteEvent, fetchMessages, sendMessage, fetchProfiles } from './lib/api';
import { LanguageProvider } from './lib/i18n';

const EmailPendingScreen: React.FC<{ email: string; onBack: () => void }> = ({ email, onBack }) => {
  const [resent, setResent] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  const handleResend = async () => {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center font-sans">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
      <p className="text-gray-500 text-sm mb-1">We sent a confirmation link to</p>
      <p className="font-semibold text-gray-800 mb-6 break-all">{email}</p>
      <p className="text-gray-400 text-xs mb-8 max-w-xs">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
      <button onClick={handleResend} disabled={resending || resent}
        className="w-full max-w-xs bg-primary text-white font-bold py-3 rounded-xl mb-3 disabled:opacity-60">
        {resent ? '✓ Email resent!' : resending ? 'Sending…' : 'Resend confirmation email'}
      </button>
      <button onClick={onBack} className="text-sm text-gray-400 font-medium">← Back to login</button>
    </div>
  );
};

type View = 'home' | 'create' | 'profile' | 'eventDetail' | 'bookings' | 'activities' | 'chat' | 'chatDetail';
type AppState = 'loading' | 'open' | 'login' | 'email-pending' | 'profile-setup' | 'main';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentView, setCurrentView] = useState<View>('home');
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedChatEventId, setSelectedChatEventId] = useState<string | null>(null);
  const [viewBeforeDetail, setViewBeforeDetail] = useState<View>('home');
  const [eventMessages, setEventMessages] = useState<Record<string, Message[]>>({});
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setEventsLoading(false);
  }, []);

  const applyProfile = useCallback((userId: string, profile: any) => {
    const displayName = profile.full_name || profile.name || '';
    const user: User = {
      id: userId,
      name: displayName,
      username: profile.username ?? '',
      age: profile.age ?? 0,
      city: profile.city ?? '',
      bio: profile.bio ?? '',
      interests: profile.interests ?? [],
      avatarUrl: profile.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=7B4FFF&color=fff`,
      nationality: profile.nationality ?? undefined,
      spokenLanguages: profile.spoken_languages ?? [],
    };
    setCurrentUser(user);
    setUsers(prev => [...prev.filter(u => u.id !== userId), user]);
    setAppState('main');
  }, []);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000));
        const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
        const displayName = profile?.full_name || profile?.name || '';
        if (profile && displayName.trim() !== '' && profile.age) {
          applyProfile(userId, profile);
        } else {
          setPendingUserId(userId);
          setPendingEmail(email ?? null);
          setAppState('profile-setup');
        }
        return;
      } catch {
        if (attempt === 2) {
          setPendingUserId(userId);
          setPendingEmail(email ?? null);
          setAppState('profile-setup');
        }
      }
    }
  }, [applyProfile]);

  useEffect(() => {
    const timeout = setTimeout(() => setAppState('open'), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setAppState('open');
      }
    }).catch(() => {
      clearTimeout(timeout);
      setAppState('open');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUsers([]);
        setEvents([]);
        setEventMessages({});
        setAppState('login');
      } else if (event === 'SIGNED_IN' && session) {
        if (!session.user.email_confirmed_at) {
          setPendingUserId(session.user.id);
          setPendingEmail(session.user.email ?? null);
          setAppState('email-pending');
        } else if (appState !== 'main') {
          await fetchProfile(session.user.id, session.user.email);
        }
      } else if (event === 'USER_UPDATED' && session?.user.email_confirmed_at) {
        await fetchProfile(session.user.id, session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Load events once user is in main app
  useEffect(() => {
    if (appState === 'main') loadEvents();
  }, [appState, loadEvents]);

  const handleEnter = () => setAppState('login');
  const handleLogin = () => {};
  const handleEmailSignup = (userId: string, email: string) => {
    setPendingUserId(userId);
    setPendingEmail(email);
    setAppState('email-pending');
  };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleProfileComplete = (user: User) => {
    setCurrentUser(user);
    setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    setPendingUserId(null);
    setPendingEmail(null);
    setAppState('main');
  };

  const handleUpdateUser = useCallback((updated: User) => {
    setCurrentUser(updated);
    setUsers(prev => [...prev.filter(u => u.id !== updated.id), updated]);
  }, []);

  const handleCreateEvent = useCallback(async (newEventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => {
    if (!currentUser) return;
    const newEvent = await createEvent(currentUser, newEventData);
    if (newEvent) setEvents(prev => [newEvent, ...prev]);
    setCurrentView('home');
  }, [currentUser]);

  const handleJoinEvent = useCallback(async (eventId: string) => {
    if (!currentUser) return;
    setEvents(prev => prev.map(e =>
      e.id === eventId && !e.attendeeIds.includes(currentUser.id)
        ? { ...e, attendeeIds: [...e.attendeeIds, currentUser.id] }
        : e
    ));
    await joinEvent(eventId, currentUser.id);
  }, [currentUser]);

  const handleLeaveEvent = useCallback(async (eventId: string) => {
    if (!currentUser) return;
    const event = events.find(e => e.id === eventId);
    if (event?.organizer.id === currentUser.id) return;
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, attendeeIds: e.attendeeIds.filter(id => id !== currentUser.id) } : e
    ));
    await leaveEvent(eventId, currentUser.id);
  }, [currentUser, events]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setCurrentView(viewBeforeDetail);
    setSelectedEventId(null);
    await deleteEvent(eventId);
  }, [viewBeforeDetail]);

  const handleSendMessage = useCallback(async (eventId: string, text: string) => {
    if (!currentUser) return;
    const msg = await sendMessage(eventId, currentUser.id, text);
    if (msg) {
      setEventMessages(prev => ({ ...prev, [eventId]: [...(prev[eventId] ?? []), msg] }));
    }
  }, [currentUser]);

  const navigateToEventDetail = async (eventId: string) => {
    setViewBeforeDetail(currentView);
    setSelectedEventId(eventId);
    setCurrentView('eventDetail');
    const event = events.find(e => e.id === eventId);
    if (event) {
      const unknownIds = event.attendeeIds.filter(id =>
        id !== event.organizer.id && !users.find(u => u.id === id)
      );
      if (unknownIds.length > 0) {
        const profiles = await fetchProfiles(unknownIds);
        if (profiles.length > 0) {
          setUsers(prev => [...prev.filter(u => !unknownIds.includes(u.id)), ...profiles]);
        }
      }
    }
  };

  const navigateBack = () => {
    setCurrentView(viewBeforeDetail);
    setSelectedEventId(null);
  };

  const navigateToChatDetail = async (eventId: string) => {
    setSelectedChatEventId(eventId);
    setLastReadTimestamps(prev => ({ ...prev, [eventId]: new Date().toISOString() }));
    setCurrentView('chatDetail');
    // Fetch messages fresh every time chat is opened
    const msgs = await fetchMessages(eventId);
    setEventMessages(prev => ({ ...prev, [eventId]: msgs }));
  };

  if (appState === 'loading') {
    return (
      <div className="app-shell bg-primary flex items-center justify-center" style={{ paddingTop: 0 }}>
        <img src="/logo.png" alt="Kruh" className="w-32 h-32 object-contain animate-pulse" />
      </div>
    );
  }

  if (appState === 'open') return <OpenScreen onEnter={handleEnter} />;
  if (appState === 'login') return <LoginScreen onLogin={handleLogin} onSignup={handleEmailSignup} />;
  if (appState === 'email-pending') return <EmailPendingScreen email={pendingEmail ?? ''} onBack={() => setAppState('login')} />;
  if (appState === 'profile-setup' && pendingUserId) {
    return <ProfileSetupScreen userId={pendingUserId} emailHint={pendingEmail ?? undefined} onComplete={handleProfileComplete} />;
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
        return <HomeScreen events={events} currentUser={currentUser} allUsers={users} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onNavigateToMap={() => setCurrentView('bookings')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
      case 'create':
        return <CreateEventScreen onCreateEvent={handleCreateEvent} onCancel={() => setCurrentView('home')} />;
      case 'profile':
        return <ProfileScreen currentUser={currentUser} events={events} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
      case 'bookings':
        return <BookingsScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} />;
      case 'activities':
        return <ActivitiesScreen currentUser={currentUser} events={events} />;
      case 'chat':
        return <ChatListScreen events={events} currentUser={currentUser} eventMessages={eventMessages} onSelectChat={navigateToChatDetail} />;
      default:
        return <HomeScreen events={events} currentUser={currentUser} allUsers={users} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onNavigateToMap={() => setCurrentView('bookings')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
    }
  };

  const selectedProfileUser = selectedProfileUserId ? users.find(u => u.id === selectedProfileUserId) : null;

  return (
    <LanguageProvider>
    <div className="app-shell bg-cream font-sans">
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: currentView !== 'chatDetail' && currentView !== 'create' ? 'calc(64px + env(safe-area-inset-bottom))' : '0' }}>
        {eventsLoading && events.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : renderContent()}
      </main>
      {currentView !== 'chatDetail' && currentView !== 'create' && (
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
    </LanguageProvider>
  );
};

export default App;
