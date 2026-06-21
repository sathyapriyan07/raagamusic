import React, { useState, useEffect } from 'react';
import { RaagaDatabase } from '../services/db';
import { Album } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { Disc, Layers, RefreshCw } from 'lucide-react';

export const Albums: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  
  // Filter variables
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    setAlbums(RaagaDatabase.getAlbums());
  }, []);

  // Compute filtering matches
  const filteredAlbums = albums.filter(album => {
    const genreMatch = selectedGenre === 'All' || album.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const langMatch = selectedLanguage === 'All' || album.language.toLowerCase().includes(selectedLanguage.toLowerCase());
    const yearMatch = selectedYear === 'All' || album.releaseYear.toString() === selectedYear;
    const typeMatch = selectedType === 'All' || album.type === selectedType;

    return genreMatch && langMatch && yearMatch && typeMatch;
  });

  const uniqueGenres = Array.from(new Set(albums.map(a => a.genre.split(' / ')).flat())).filter(Boolean);
  const uniqueLanguages = Array.from(new Set(albums.map(a => a.language.split(' / ')).flat())).filter(Boolean);
  const uniqueYears = Array.from(new Set(albums.map(a => a.releaseYear.toString()))).sort((a,b) => (b as string).localeCompare(a as string));

  const resetAllFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedYear('All');
    setSelectedType('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Discography Catalog
          </h1>
          <p className="text-sm text-white/50 font-normal">
            Explore {filteredAlbums.length} curated LPs, EPs, and singles archives.
          </p>
        </div>

        <button 
          onClick={resetAllFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white border border-white/5 transition-all text-center self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-5 rounded-2.5xl bg-[#121212] border border-white/5 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Genre filter */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Genre Filter
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

        {/* Language Filter */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Language Origin
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

        {/* Year Selector */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Release Date (Year)
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

        {/* Type selector */}
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
            Disc Format
          </label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 focus:border-[#1DB954] outline-none text-xs sm:text-sm cursor-pointer hover:bg-[#202020] transition-colors"
          >
            <option value="All">All Types</option>
            <option value="album">Albums (LP)</option>
            <option value="single">Singles</option>
            <option value="ep">EPs</option>
          </select>
        </div>
      </div>

      {/* Grid displays */}
      {filteredAlbums.length === 0 ? (
        <div className="text-center py-24 bg-[#121212] border border-dashed border-white/10 rounded-3xl">
          <Disc className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-white text-lg font-semibold">No albums discovered</h3>
          <p className="text-sm text-white/40 mt-1">Try resetting the drop-down filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-fade-in">
          {filteredAlbums.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

    </div>
  );
};
