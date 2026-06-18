import { useState } from 'react';
import type { AppPage } from './types';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import EligibilityPage from './pages/EligibilityPage';
import SimplifyPage from './pages/SimplifyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const { isAuthenticated } = useAuth();

  const renderPage = () => {
    if (!isAuthenticated && !['login', 'register', 'home'].includes(currentPage)) {
      setCurrentPage('login');
      return null;
    }

    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'eligibility':
        return <EligibilityPage />;
      case 'simplify':
        return <SimplifyPage />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className={currentPage === 'home' ? '' : 'pt-24'}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
