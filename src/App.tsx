import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { RaagaDatabase } from './services/db';

// Imported pages
import { Home } from './pages/Home';
import { Songs } from './pages/Songs';
import { Albums } from './pages/Albums';
import { Artists } from './pages/Artists';
import { SongDetail } from './pages/SongDetail';
import { AlbumDetail } from './pages/AlbumDetail';
import { ArtistDetail } from './pages/ArtistDetail';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

// Common friendly fallback Page
const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <h2 className="text-white font-display font-black text-3xl">404 — Page Not Found</h2>
      <p className="text-white/40 text-sm">The metadata directory route could not be found in Raaga network.</p>
      <Link 
        to="/" 
        className="px-6 py-2.5 rounded-full bg-[#1DB954] text-black font-bold text-xs inline-block shadow transition-transform transform active:scale-95"
      >
        Return to Home Discovery
      </Link>
    </div>
  );
};

export default function App() {
  useEffect(() => {
    RaagaDatabase.initFromSupabase().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col antialiased w-full max-w-full overflow-x-hidden">
          
          {/* Header Navigation (Sticky + Responsive) */}
          <Navigation />

          {/* Dynamic Nested Routes Page Stage */}
          <main className="flex-1 w-full relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/song/:id" element={<SongDetail />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
