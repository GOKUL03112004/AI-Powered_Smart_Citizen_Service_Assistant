import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  CheckCircle2,
  FileText,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chat', label: 'Chat Assistant', icon: MessageSquare },
  { path: '/eligibility', label: 'Eligibility Checker', icon: CheckCircle2 },
  { path: '/simplify', label: 'Policy Simplifier', icon: FileText },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { isAuthenticated, username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gov-navy shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-heading font-bold text-white text-sm leading-tight">
                CitizenAssist AI
              </p>
              <p className="text-[10px] text-blue-300 leading-tight">
                Smart Government Services
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === path
                    ? 'bg-primary-600 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            
            {/* Auth section */}
            <div className="ml-4 pl-4 border-l border-white/20 flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-blue-200">Hi, {username}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-blue-200 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gov-navy border-t border-white/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  location.pathname === path
                    ? 'bg-primary-600 text-white'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
