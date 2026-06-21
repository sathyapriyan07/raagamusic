import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, ChevronRight, Music, Disc, Users, AlertCircle } from 'lucide-react';
import { RaagaDatabase } from '../services/db';
import { CuratedSection, Song, Album, Artist } from '../types';
import { SongCard } from '../components/SongCard';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';

export const Home: React.FC = () => {
  const [curatedSections, setCuratedSections] = useState<CuratedSection[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  
  // Featured hero states
  const [featuredAlbum, setFeaturedAlbum] = useState<Album | null>(null);

  useEffect(() => {
    // Load metadata lists
    const loadedCurated = RaagaDatabase.getCurated();
    const loadedSongs = RaagaDatabase.getSongs();
    const loadedAlbums = RaagaDatabase.getAlbums();
    const loadedArtists = RaagaDatabase.getArtists();

    setCuratedSections(loadedCurated);
    setSongs(loadedSongs);
    setAlbums(loadedAlbums);
    setArtists(loadedArtists);

    if (loadedAlbums.length > 0) {
      setFeaturedAlbum(loadedAlbums[0]);
    }
  }, []);

  // Helper resolver to fetch individual curated item components
  const renderCuratedItem = (itemRef: { type: 'song' | 'album' | 'artist'; id: string }) => {
    if (itemRef.type === 'song') {
      const match = songs.find(s => s.id === itemRef.id);
      return match ? <div className="w-[180px] sm:w-[220px] shrink-0" key={itemRef.id}><SongCard song={match} /></div> : null;
    } else if (itemRef.type === 'album') {
      const match = albums.find(al => al.id === itemRef.id);
      return match ? <div className="w-[180px] sm:w-[220px] shrink-0" key={itemRef.id}><AlbumCard album={match} /></div> : null;
    } else if (itemRef.type === 'artist') {
      const match = artists.find(art => art.id === itemRef.id);
      return match ? <div className="w-[180px] sm:w-[220px] shrink-0" key={itemRef.id}><ArtistCard artist={match} /></div> : null;
    }
    return null;
  };

  return (
    <div className="space-y-12 pb-24 w-full overflow-hidden">
      {/* 1. Cinematic Billboard Hero Section */}
      {featuredAlbum && (
        <section 
          id="cinematic-billboard-hero"
          className="relative w-full h-[60vh] sm:h-[75vh] flex items-end overflow-hidden"
        >
          {/* Layer 1: Blurred Artwork Backdrop */}
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-35"
            style={{ backgroundImage: `url(${featuredAlbum.artwork})` }}
          />

          {/* Layer 2: Vignette Shadow Overlay */}
          <div className="absolute inset-0 hero-overlay z-10" />

          {/* Layer 3: Main Artwork behind blur overlay for depth */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[60%] opacity-20 lg:opacity-40 pointer-events-none hidden sm:block z-5">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${featuredAlbum.artwork})`,
                maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
              }}
            />
          </div>

          {/* Layer 4: Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 sm:pb-16 flex flex-col md:flex-row items-start md:items-end gap-6 sm:gap-10">
            {/* Front Artwork Card */}
            <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 shrink-0 mx-auto md:mx-0">
              <img 
                src={featuredAlbum.artwork} 
                alt={featuredAlbum.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title Block */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Discovery
                </span>
                <span className="text-white/40 text-xs font-mono">{featuredAlbum.genre}</span>
                <span className="text-white/45 text-xs font-mono">• {featuredAlbum.releaseYear}</span>
              </div>

              {/* Title Logo representation (as requested by TMDB Logo requirements) */}
              <div className="space-y-1">
                {featuredAlbum.logoUrl ? (
                  <div className="inline-block py-1">
                    <img 
                      src={featuredAlbum.logoUrl} 
                      alt={featuredAlbum.name} 
                      className="max-h-16 max-w-[280px] sm:max-w-[400px] object-contain object-left mx-auto md:mx-0 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                ) : (
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none">
                    {featuredAlbum.name}
                  </h1>
                )}

                <p className="text-white/70 text-sm sm:text-base md:text-lg font-medium">
                  by{' '}
                  {featuredAlbum.artists.map((art, i) => (
                    <Link 
                      key={art.id} 
                      to={`/artist/${art.id}`} 
                      className="text-white hover:text-[#1DB954] underline hover:no-underline transition-colors font-bold"
                    >
                      {art.name}
                    </Link>
                  ))}
                </p>
              </div>

              {/* Info stats */}
              <p className="text-white/40 text-xs sm:text-sm font-mono leading-relaxed">
                Metadata catalog size: {featuredAlbum.trackIds.length} records mapped • Duration runtime: {featuredAlbum.runtime}
              </p>

              {/* Streaming links bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link 
                  to={`/album/${featuredAlbum.id}`}
                  className="px-6 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs sm:text-sm font-bold shadow-lg shadow-[#1db954]/25 transition-all transform hover:scale-105 active:scale-95"
                >
                  Explore Credits & Roster
                </Link>
                
                {featuredAlbum.streamingLinks?.spotify && (
                  <a 
                    href={featuredAlbum.streamingLinks.spotify}
                    target="_blank"
                    rel="noreferrer referrerPolicy"
                    className="p-2.5 rounded-full bg-[#121212]/80 border border-white/5 hover:border-white/15 text-white/80 hover:text-white transition-all transform hover:scale-105"
                    title="Spotify Music Discovery Link"
                  >
                    <span className="text-xs font-semibold px-2">Spotify</span>
                  </a>
                )}
                {featuredAlbum.streamingLinks?.appleMusic && (
                  <a 
                    href={featuredAlbum.streamingLinks.appleMusic}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full bg-[#121212]/80 border border-white/5 hover:border-white/15 text-white/80 hover:text-white transition-all transform hover:scale-105"
                    title="Apple Music Links"
                  >
                    <span className="text-xs font-semibold px-2">Apple</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 2. Admin Curated Rows (Spotify horizontal lists) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {curatedSections.map((section) => {
          // Skip inactive row sections
          if (section.itemIds.length === 0) return null;

          return (
            <div key={section.id} className="space-y-3 relative group/row">
              {/* Row title bar */}
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-xs sm:text-sm text-white/40 font-normal leading-tight mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="text-[#1DB954] hover:text-white text-xs font-bold font-mono flex items-center gap-1 transition-colors cursor-pointer">
                  See Full Roster <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Slider list */}
              <div 
                className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x"
              >
                {section.itemIds.map((itemRef) => renderCuratedItem(itemRef))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Global Stats Grid */}
      <section className="bg-[#121212] border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-display font-extrabold text-white">{songs.length}</p>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-widest font-mono">Songs Indexed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-display font-extrabold text-white">{albums.length}</p>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-widest font-mono">Albums Archived</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-display font-extrabold text-white">{artists.length}</p>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-widest font-mono">Artists Profiles</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-display font-extrabold text-white">100%</p>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-widest font-mono">Credits Accuracy</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-16 pb-28 text-center text-white/30 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music className="w-3 h-3 text-black fill-current" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-white/80">
            raaga music discovery
          </span>
        </div>
        <p className="text-[11px] font-mono leading-relaxed max-w-md mx-auto px-4">
          Raaga is a comprehensive metadata archiving network designed for cinematic scores, legendary conductors, songwriter credits, and streaming references. No audio streaming exists on this service. Powered by iTunes and TMDB feeds.
        </p>
        <p className="text-[10px] text-white/10">
          © 2026 Raaga Discovery. Built for full-stack responsive devices.
        </p>
      </footer>

    </div>
  );
};
