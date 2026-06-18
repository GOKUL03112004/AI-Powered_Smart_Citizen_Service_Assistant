import { useState } from 'react';
import type { AppPage } from './types';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import EligibilityPage from './pages/EligibilityPage';
import SimplifyPage from './pages/SimplifyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'eligibility':
        return <EligibilityPage />;
      case 'simplify':
        return <SimplifyPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className={currentPage === 'home' ? '' : 'pt-0'}>
        {renderPage()}
      </main>
    </div>
  );
}
