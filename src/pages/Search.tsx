import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RaagaDatabase } from '../services/db';
import { Song, Album, Artist } from '../types';
import { Search as SearchIcon, Music, Disc, Users, CornerDownLeft, Keyboard, AlertCircle } from 'lucide-react';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  // Database sets
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  // Search results
  const [matchedSongs, setMatchedSongs] = useState<Song[]>([]);
  const [matchedAlbums, setMatchedAlbums] = useState<Album[]>([]);
  const [matchedArtists, setMatchedArtists] = useState<Artist[]>([]);

  // Keyboard Navigation Index State
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize DB once
  useEffect(() => {
    setSongs(RaagaDatabase.getSongs());
    setAlbums(RaagaDatabase.getAlbums());
    setArtists(RaagaDatabase.getArtists());
    
    // Focus search input on page load
    inputRef.current?.focus();
  }, []);

  // Compute live search instantly
  useEffect(() => {
    if (!query.trim()) {
      setMatchedSongs([]);
      setMatchedAlbums([]);
      setMatchedArtists([]);
      setSelectedIndex(-1);
      return;
    }

    const q = query.toLowerCase();

    const filteredSongs = songs.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.albumName && s.albumName.toLowerCase().includes(q)) || 
      s.artists.some(art => art.name.toLowerCase().includes(q))
    ).slice(0, 5);

    const filteredAlbums = albums.filter(al => 
      al.name.toLowerCase().includes(q) || 
      al.artists.some(art => art.name.toLowerCase().includes(q)) ||
      al.genre.toLowerCase().includes(q)
    ).slice(0, 5);

    const filteredArtists = artists.filter(art => 
      art.name.toLowerCase().includes(q) || 
      art.bio.toLowerCase().includes(q) || 
      art.primaryRole.toLowerCase().includes(q)
    ).slice(0, 5);

    setMatchedSongs(filteredSongs);
    setMatchedAlbums(filteredAlbums);
    setMatchedArtists(filteredArtists);

    // Reset selected index when query changes
    setSelectedIndex(-1);
  }, [query, songs, albums, artists]);

  // Combined flat array representing ordered searchable items for keyboard navigation overrides
  const combinedResults: (
    | { type: 'song'; id: string; name: string; subtitle: string; route: string }
    | { type: 'album'; id: string; name: string; subtitle: string; route: string }
    | { type: 'artist'; id: string; name: string; subtitle: string; route: string }
  )[] = [];

  matchedSongs.forEach(s => {
    combinedResults.push({
      type: 'song',
      id: s.id,
      name: s.name,
      subtitle: `Track • ${s.artists.map(a => a.name).join(', ')}`,
      route: `/song/${s.id}`
    });
  });

  matchedAlbums.forEach(al => {
    combinedResults.push({
      type: 'album',
      id: al.id,
      name: al.name,
      subtitle: `Album • ${al.artists.map(a => a.name).join(', ')}`,
      route: `/album/${al.id}`
    });
  });

  matchedArtists.forEach(art => {
    combinedResults.push({
      type: 'artist',
      id: art.id,
      name: art.name,
      subtitle: `Artist • ${art.primaryRole}`,
      route: `/artist/${art.id}`
    });
  });

  // Handle global keyboard keystrokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (combinedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % combinedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + combinedResults.length) % combinedResults.length);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < combinedResults.length) {
        e.preventDefault();
        navigate(combinedResults[selectedIndex].route);
      }
    } else if (e.key === 'Escape') {
      setQuery('');
      setSelectedIndex(-1);
    }
  };

  const promoteQuickQuery = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-32">
      
      {/* 1. Styled Search Input Header Banner */}
      <div className="space-y-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
            Global Metadata Search
          </h1>
          <p className="text-xs sm:text-sm text-white/50 font-normal">
            Enter titles, conductors, performing vocals, or genres. Fully supports keyboard arrows navigation.
          </p>
        </div>

        {/* Input box */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DB954]" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search matching songs, albums, and artists..."
            className="w-full pl-12 pr-28 py-3.5 rounded-full bg-[#121212] hover:bg-[#181818] focus:bg-[#181818] border border-white/5 focus:border-[#1DB954]/55 text-white placeholder-white/20 sm:text-base outline-none transition-all shadow-inner"
          />
          {/* Keyboard Helper Tag info */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-[9px] font-mono tracking-widest text-white/40 border border-white/5 uppercase">
            <Keyboard className="w-3.5 h-3.5" /> Arrow keys
          </span>
        </div>
      </div>

      {/* 2. Results Board / Keyboard selector list */}
      {!query.trim() ? (
        /* Default Suggestion Boards */
        <div className="space-y-6 pt-4 animate-fade-in">
          <h3 className="font-mono text-[10px] font-bold text-white/40 tracking-widest uppercase">Search Suggestions</h3>
          <div className="flex flex-wrap gap-2">
            {['Songs', 'Albums', 'Artists', 'Soundtracks', 'Pop', 'Rock', 'Instrumental'].map((term) => (
              <button
                key={term}
                onClick={() => promoteQuickQuery(term)}
                className="px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#1DB954] hover:text-black border border-white/5 text-white/80 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2.5xl bg-white/5 border border-white/10 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-[#1DB954] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">How Keyboard Navigation Works:</p>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Type your search keyword, then use the <kbd className="font-bold text-white font-mono">↓ ArrowDown</kbd> or <kbd className="font-bold text-white font-mono">↑ ArrowUp</kbd> keys on your keyboard to instantly select a matching song, album, or artist record in the unified index beneath. Hit <kbd className="font-bold text-white font-mono">Enter</kbd> to open.
              </p>
            </div>
          </div>
        </div>
      ) : combinedResults.length === 0 ? (
        /* Empty States */
        <div className="text-center py-20 bg-[#121212] border border-dashed border-white/5 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h4 className="text-white font-semibold">No indexing hits for "{query}"</h4>
          <p className="text-sm text-white/40 mt-1">Double check your spellings or explore quick prompt tokens above.</p>
        </div>
      ) : (
        /* Results Categories List with Keyboard Highlight Indicators */
        <div className="space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-2.5xl p-2.5 shadow divide-y divide-white/5 overflow-hidden">
            <div className="px-4 py-2 bg-white/5 font-mono text-[9px] font-bold text-white/40 uppercase tracking-widest rounded-t-xl flex justify-between">
              <span>UNIFIED DIRECTORY MATCHES ({combinedResults.length})</span>
              <span>Use keys to navigate</span>
            </div>

            {combinedResults.map((result, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Link 
                  key={`${result.type}-${result.id}`}
                  to={result.route}
                  className={`flex items-center justify-between p-3.5 transition-all text-sm ${isSelected ? 'bg-[#1DB954]/15 border-l-4 border-l-[#1DB954] pl-4.5' : 'hover:bg-white/5'}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    {result.type === 'song' && <Music className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1DB954]' : 'text-white/30'}`} />}
                    {result.type === 'album' && <Disc className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1DB954]' : 'text-white/30'}`} />}
                    {result.type === 'artist' && <Users className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1DB954]' : 'text-white/30'}`} />}
                    
                    <div className="truncate">
                      <p className={`font-bold transition-colors ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>{result.name}</p>
                      <p className="text-[11px] text-white/40 mt-0.5 font-normal">{result.subtitle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[9px] text-[#1DB954] font-mono tracking-widest font-bold">
                      SELECT <CornerDownLeft className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Grouped visual cards for deep visual grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Category column songs */}
            <div className="space-y-3">
              <h4 className="font-display font-extrabold text-sm text-white/80 pb-2 border-b border-white/5 flex items-center gap-1.5 leading-none">
                <Music className="w-4 h-4 text-[#1DB954]" /> Songs hits
              </h4>
              <div className="space-y-2">
                {matchedSongs.map(s => (
                  <Link 
                    key={s.id} 
                    to={`/song/${s.id}`} 
                    className="p-3 bg-[#121212] hover:bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl flex items-center gap-2.5 transition-all block"
                  >
                    <img src={s.artwork} alt={s.name} className="w-8 h-8 rounded object-cover" />
                    <div className="truncate text-xs">
                      <p className="font-bold text-white hover:text-[#1DB954] truncate">{s.name}</p>
                      <p className="text-white/40 text-[10px] truncate">by {s.artists[0]?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category column albums */}
            <div className="space-y-3">
              <h4 className="font-display font-extrabold text-sm text-white/80 pb-2 border-b border-white/5 flex items-center gap-1.5 leading-none">
                <Disc className="w-4 h-4 text-[#1DB954]" /> Albums hits
              </h4>
              <div className="space-y-2">
                {matchedAlbums.map(al => (
                  <Link 
                    key={al.id} 
                    to={`/album/${al.id}`} 
                    className="p-3 bg-[#121212] hover:bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl flex items-center gap-2.5 transition-all block"
                  >
                    <img src={al.artwork} alt={al.name} className="w-8 h-8 rounded object-cover" />
                    <div className="truncate text-xs">
                      <p className="font-bold text-white hover:text-[#1DB954] truncate">{al.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{al.genre} • {al.releaseYear}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category column artists */}
            <div className="space-y-3">
              <h4 className="font-display font-extrabold text-sm text-white/80 pb-2 border-b border-white/5 flex items-center gap-1.5 leading-none">
                <Users className="w-4 h-4 text-[#1DB954]" /> Artists hits
              </h4>
              <div className="space-y-2">
                {matchedArtists.map(art => (
                  <Link 
                    key={art.id} 
                    to={`/artist/${art.id}`} 
                    className="p-3 bg-[#121212] hover:bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl flex items-center gap-2.5 transition-all block"
                  >
                    <img src={art.image} alt={art.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="truncate text-xs">
                      <p className="font-bold text-white hover:text-[#1DB954] truncate">{art.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{art.primaryRole}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
