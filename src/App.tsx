import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AuthForms } from './components/Auth/AuthForms';
import { Header } from './components/Layout/Header';
import { UserDashboard } from './components/Dashboard/UserDashboard';
import { BrowseSkills } from './components/Browse/BrowseSkills';
import { SwapRequests } from './components/Requests/SwapRequests';
import { UserProfile } from './components/Profile/UserProfile';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { UserManagement } from './components/Admin/UserManagement';
import { SwapManagement } from './components/Admin/SwapManagement';
import { MessageManagement } from './components/Admin/MessageManagement';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'admin-dashboard' : 'dashboard');

  if (!user) {
    return <AuthForms />;
  }

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'admin-dashboard': return <AdminDashboard />;
        case 'users': return <UserManagement />;
        case 'swaps': return <SwapManagement />;
        case 'messages': return <MessageManagement />;
        default: return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <UserDashboard />;
        case 'browse': return <BrowseSkills setActiveTab={setActiveTab} />;
        case 'requests': return <SwapRequests />;
        case 'profile': return <UserProfile />;
        default: return <UserDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>{renderContent()}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;