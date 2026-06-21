import React, { useState, useEffect } from 'react';
import { RaagaDatabase } from '../services/db';
import { Song, Artist } from '../types';
import { SongCard } from '../components/SongCard';
import { SpotifyTable } from '../components/SpotifyTable';
import { Grid, List, Filter, ArrowUpDown, RefreshCw, Layers } from 'lucide-react';

export const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  
  // Layout views
  const [isGridView, setIsGridView] = useState(true);

  // Filters state
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Infinite Scroll Slice State
  const [displayLimit, setDisplayLimit] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setSongs(RaagaDatabase.getSongs());
    setArtists(RaagaDatabase.getArtists());
  }, []);

  // Compute filters
  const filteredSongs = songs.filter(song => {
    const genreMatch = selectedGenre === 'All' || song.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const langMatch = selectedLanguage === 'All' || song.language.toLowerCase().includes(selectedLanguage.toLowerCase());
    const yearMatch = selectedYear === 'All' || song.releaseYear.toString() === selectedYear;
    
    const artistMatch = selectedArtist === 'All' || song.artists.some(art => art.id === selectedArtist);

    return genreMatch && langMatch && yearMatch && artistMatch;
  });

  // Sort logic
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.releaseYear - a.releaseYear;
    } else if (sortBy === 'oldest') {
      return a.releaseYear - b.releaseYear;
    } else if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Unique elements for filter selectors
  const uniqueGenres = Array.from(new Set(songs.map(s => s.genre.split(' / ')).flat())).filter(Boolean);
  const uniqueLanguages = Array.from(new Set(songs.map(s => s.language.split(' / ')).flat())).filter(Boolean);
  const uniqueYears = Array.from(new Set(songs.map(s => s.releaseYear.toString()))).sort((a,b) => (b as string).localeCompare(a as string));

  const itemsToDisplay = sortedSongs.slice(0, displayLimit);
  const hasMore = sortedSongs.length > displayLimit;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit(prev => prev + 8);
      setIsLoadingMore(false);
    }, 450); // micro skeleton lag for realism
  };

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedYear('All');
    setSelectedArtist('All');
    setSortBy('newest');
    setDisplayLimit(8);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Discover Songs
          </h1>
          <p className="text-sm text-white/50 font-normal">
            Query across {filteredSongs.length} annotated tracks • Toggle grid/list listings.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Toggle buttons */}
          <div className="flex items-center p-1 rounded-xl bg-[#121212] border border-white/5">
            <button 
              onClick={() => setIsGridView(true)}
              className={`p-2 rounded-lg transition-colors ${
                isGridView ? 'bg-[#1DB954] text-black' : 'text-white/40 hover:text-white'
              }`}
              title="Grid View Layout"
            >
              <Grid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button 
              onClick={() => setIsGridView(false)}
              className={`p-2 rounded-lg transition-colors ${
                !isGridView ? 'bg-[#1DB954] text-black' : 'text-white/40 hover:text-white'
              }`}
              title="Spotify List View"
            >
              <List className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <button 
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white border border-white/5 transition-all text-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Filter and Sorting Drawer Panel */}
      <div className="p-5 rounded-2.5xl bg-[#121212] border border-white/5 shadow-xl grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Genre Select */}
        <div className="space-y-1.5Col">
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Genre Class
          </label>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="All">All Genres</option>
            {uniqueGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Language Select */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Language
          </label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="All">All Languages</option>
            {uniqueLanguages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Year Select */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Release Year
          </label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="All">All Years</option>
            {uniqueYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Artist Select */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Artist / Performer
          </label>
          <select 
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="All">All Artists</option>
            {artists.map(art => (
              <option key={art.id} value={art.id}>{art.name}</option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Sort Order
          </label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="newest">Release: Newest</option>
            <option value="oldest">Release: Oldest</option>
            <option value="alphabetical">Song Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Results Board */}
      {itemsToDisplay.length === 0 ? (
        <div className="text-center py-24 bg-[#121212] border border-dashed border-white/10 rounded-3xl">
          <Layers className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-white text-lg font-semibold">No songs match your criteria</h3>
          <p className="text-sm text-white/40 mt-1">Try modifying your filter settings or resetting filters above.</p>
        </div>
      ) : isGridView ? (
        /* Gird View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {itemsToDisplay.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 sm:p-6 overflow-hidden shadow">
          <SpotifyTable songs={itemsToDisplay} />
        </div>
      )}

      {/* Loading Skeletal / Infinite Load Trig */}
      {hasMore && (
        <div className="text-center pt-8">
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 inline-flex"
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                Querying Archive...
              </>
            ) : (
              'Load More Discoveries'
            )}
          </button>
        </div>
      )}

    </div>
  );
};
