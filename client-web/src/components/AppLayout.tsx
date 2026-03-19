import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ITSMProvider, useITSM } from '@/context/ITSMContext';
import Sidebar from './itsm/Sidebar';
import Header from './itsm/Header';
import Dashboard from './itsm/Dashboard';
import TicketList from './itsm/TicketList';
import TicketDetail from './itsm/TicketDetail';
import AssetManagement from './itsm/AssetManagement';
import KnowledgeBase from './itsm/KnowledgeBase';
import ChangeManagement from './itsm/ChangeManagement';
import ProblemManagement from './itsm/ProblemManagement';
import Analytics from './itsm/Analytics';
import Settings from './itsm/Settings';
import CreateTicketModal from './itsm/CreateTicketModal';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import PasswordResetPage from './auth/PasswordResetPage';
import { Loader2 } from 'lucide-react';

type AuthView = 'login' | 'register' | 'reset';

function AuthFlow() {
  const [authView, setAuthView] = useState<AuthView>('login');

  switch (authView) {
    case 'register':
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    case 'reset':
      return <PasswordResetPage onSwitchToLogin={() => setAuthView('login')} />;
    default:
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView('register')}
          onSwitchToReset={() => setAuthView('reset')}
        />
      );
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function ITSMApp() {
  const { currentView, notifications, dismissNotification } = useITSM();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tickets':
        return <TicketList />;
      case 'ticket-detail':
        return <TicketDetail />;
      case 'assets':
        return <AssetManagement />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'changes':
        return <ChangeManagement />;
      case 'problems':
        return <ProblemManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
      }`}>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Create ticket modal */}
      <CreateTicketModal />

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg border animate-slide-in
              ${notification.type === 'success' ? 'bg-green-50 border-green-200' :
                notification.type === 'error' ? 'bg-red-50 border-red-200' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className={`font-medium text-sm ${
                  notification.type === 'success' ? 'text-green-900' :
                  notification.type === 'error' ? 'text-red-900' :
                  notification.type === 'warning' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {notification.title}
                </p>
                <p className={`text-xs mt-0.5 ${
                  notification.type === 'success' ? 'text-green-700' :
                  notification.type === 'error' ? 'text-red-700' :
                  notification.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtectedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return (
    <ITSMProvider>
      <ITSMApp />
    </ITSMProvider>
  );
}

export default function AppLayout() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
