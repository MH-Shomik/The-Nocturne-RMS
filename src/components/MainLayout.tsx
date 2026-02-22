// Main layout component with navigation and WorldPlate branding
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { authService } from '../services/authService';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, setUser } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    navigate('/menu');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      { path: '/menu', label: 'Menu', icon: '🍽️', public: true },
      { path: '/reservations', label: 'Tables', icon: '🪑', public: true },
    ];

    if (user) {
      if (user.role === 'kitchen' || user.role === 'admin') {
        items.push({ path: '/kitchen', label: 'Kitchen', icon: '👨‍🍳', public: false });
      }
      
      if (user.role === 'admin') {
        items.push({ path: '/management', label: 'Management', icon: '⚙️', public: false });
      }
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-deep-black">
      {/* Header Navigation */}
      <header className="bg-warm-brown/10 border-b border-warm-brown/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-accent-gold rounded-lg flex items-center justify-center group-hover:bg-accent-orange transition-colors">
                <span className="text-deep-black font-display font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-light-gray">
                  The Nocturne
                </h1>
                <p className="text-xs text-warm-beige -mt-1">
                  Interactive RMS
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-accent-gold text-deep-black'
                      : 'text-light-gray hover:bg-warm-brown/50 hover:text-accent-gold'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">


              {/* User menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-warm-beige text-sm">
                    Welcome, <span className="text-accent-gold">{user.name}</span>
                  </span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-accent-gold text-deep-black' :
                    user.role === 'kitchen' ? 'bg-fresh-green text-deep-black' :
                    'bg-warm-brown text-light-gray'
                  }`}>
                    {user.role.toUpperCase()}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-warm-beige hover:text-alert-red transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Staff Login
                </Link>
              )}

              {/* Mobile menu button */}
              <button className="md:hidden p-2 text-light-gray hover:text-accent-gold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-warm-brown/20">
          <div className="px-4 py-3 space-y-1">
            {getNavigationItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent-gold text-deep-black'
                    : 'text-light-gray hover:bg-warm-brown/50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-warm-brown/5 border-t border-warm-brown/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-warm-beige text-sm">
                © 2026 The Nocturne Interactive RMS. All rights reserved.
              </p>
              <p className="text-warm-beige/70 text-xs mt-1">
                Crafted with modern technology for immersive dining experiences.
              </p>
            </div>
            
            <div className="flex space-x-6 text-sm text-warm-beige">
              <a href="#" className="hover:text-accent-gold transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent-gold transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-accent-gold transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;