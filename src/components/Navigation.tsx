import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Music, Disc, Users, Search, Sliders, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/songs', label: 'Songs', icon: Music },
    { path: '/albums', label: 'Albums', icon: Disc },
    { path: '/artists', label: 'Artists', icon: Users },
    { path: '/search', label: 'Search', icon: Search },
  ];

  return (
    <>
      {/* Top Header - Desktop & Tablet */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0a0acc]/80 border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Left: Raaga Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link id="header-logo-lnk" to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1db954]/20 group-hover:scale-105 transition-transform">
                <Music className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-white/90 transition-colors">
                raaga<span className="text-[#1DB954]">.</span>
              </span>
            </Link>
          </div>

          {/* Center: Search Trigger (Desktop only) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div 
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full bg-[#181818] hover:bg-[#222] border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-200"
            >
              <Search className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/40 font-normal">Search songs, albums, artists...</span>
            </div>
          </div>

          {/* Right: Authenticated User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-4">
                {/* Admin Mode Quick Toggle & Admin Dashboard Link */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] sm:text-sm font-medium border border-white/10 transition-all shrink-0"
                  >
                    <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1DB954]" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                )}

                {/* Profile menu details */}
                <div className="flex items-center gap-1.5 group relative shrink-0">
                  <div className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/10 transition-colors">
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                      alt={user.username} 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-medium text-white max-w-[100px] truncate">{user.username}</p>
                      <p className="text-[9px] text-[#1DB954] uppercase font-bold tracking-wider">{user.role}</p>
                    </div>
                  </div>

                  {/* Hover dropdown quick logout or toggle role */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#181818] border border-white/10 rounded-xl p-1 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 origin-top-right z-50">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                      <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                    </div>
                    
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold text-xs sm:text-sm shadow-md transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 rounded-full bg-[#121212dc] backdrop-blur-xl border border-white/5 px-6 py-2.5 z-45 shadow-2xl">
        <ul className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className="flex flex-col items-center gap-1.5 transition-all text-center"
                >
                  <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'text-[#1DB954] scale-110 stroke-[2.5]' : 'text-white/40'}`} />
                  <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-white font-semibold' : 'text-white/40'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
