
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';
import Sidebar from './components/Sidebar';
import { initialUsers } from './services/mockData';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Check for session in local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('veye_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email: string) => {
    const user = initialUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('veye_user', JSON.stringify(user));
      setCurrentPath('dashboard');
    } else {
      alert("Invalid credentials for this demo. Use 'demo@client.com'");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('veye_user');
    setCurrentPath('dashboard');
  };

  const navigateTo = (path: string, ticketId?: string) => {
    setCurrentPath(path);
    if (ticketId) setSelectedTicketId(ticketId);
    else if (path === 'dashboard') setSelectedTicketId(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={navigateTo} 
        currentPath={currentPath}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentPath === 'dashboard' && (
            <Dashboard 
              currentUser={currentUser} 
              onViewTicket={(id) => navigateTo('ticket-detail', id)}
              onCreateTicket={() => navigateTo('new-ticket')}
            />
          )}
          {currentPath === 'new-ticket' && (
            <NewTicket 
              currentUser={currentUser} 
              onSuccess={(ticketId) => navigateTo('ticket-detail', ticketId)}
              onCancel={() => navigateTo('dashboard')}
            />
          )}
          {currentPath === 'ticket-detail' && selectedTicketId && (
            <TicketDetail 
              ticketId={selectedTicketId} 
              currentUser={currentUser}
              onBack={() => navigateTo('dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
