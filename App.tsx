import React, { useState, useCallback } from 'react';
import { Event, User, Message } from './types';
import { MOCK_EVENTS, MOCK_USERS, CURRENT_USER_ID, MOCK_EVENT_MESSAGES } from './constants';
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

type View = 'home' | 'create' | 'profile' | 'eventDetail' | 'bookings' | 'activities' | 'chat' | 'chatDetail';
type AppState = 'open' | 'login' | 'main';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('open');
  const [currentView, setCurrentView] = useState<View>('home');
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [users] = useState<User[]>(MOCK_USERS);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedChatEventId, setSelectedChatEventId] = useState<number | null>(null);
  const [viewBeforeDetail, setViewBeforeDetail] = useState<View>('home');
  const [eventMessages, setEventMessages] = useState<Record<number, Message[]>>(MOCK_EVENT_MESSAGES);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<number | null>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<number, string>>({});

  const currentUser = users.find(u => u.id === CURRENT_USER_ID)!;

  const handleEnter = () => setAppState('login');
  const handleLogin = () => setAppState('main');
  const handleLogout = () => setAppState('login');

  const handleCreateEvent = useCallback((newEventData: Omit<Event, 'id' | 'organizer' | 'attendeeIds'>) => {
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
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId && !event.attendeeIds.includes(currentUser.id)
          ? { ...event, attendeeIds: [...event.attendeeIds, currentUser.id] }
          : event
      )
    );
  }, [currentUser.id]);

  const handleLeaveEvent = useCallback((eventId: number) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, attendeeIds: event.attendeeIds.filter(id => id !== currentUser.id) }
          : event
      )
    );
  }, [currentUser.id]);

  const handleSendMessage = useCallback((eventId: number, text: string) => {
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
  }, [currentUser.id]);

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
        return <HomeScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
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
        return <HomeScreen events={events} currentUser={currentUser} onSelectEvent={navigateToEventDetail} onNavigateToCreate={() => setCurrentView('create')} onJoin={handleJoinEvent} onLeave={handleLeaveEvent} />;
    }
  };

  if (appState === 'open') return <OpenScreen onEnter={handleEnter} />;
  if (appState === 'login') return <LoginScreen onLogin={handleLogin} />;

  const selectedProfileUser = selectedProfileUserId ? users.find(u => u.id === selectedProfileUserId) : null;

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col font-sans">
      <main className="flex-grow">
        {renderContent()}
      </main>
      {currentView !== 'chatDetail' && (
        <BottomNav
          currentView={currentView}
          setCurrentView={setCurrentView as (view: 'home' | 'bookings' | 'create' | 'chat' | 'profile') => void}
          badges={{ chat: chatUnreadCount }}
        />
      )}
      {selectedProfileUser && (
        <UserProfileModal
          user={selectedProfileUser}
          events={events}
          currentUser={currentUser}
          onClose={() => setSelectedProfileUserId(null)}
        />
      )}
    </div>
  );
};

export default App;
