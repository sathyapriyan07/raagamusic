import React, { useState, useEffect } from 'react';
import { RaagaDatabase } from '../services/db';
import { Artist } from '../types';
import { ArtistCard } from '../components/ArtistCard';
import { Search, Users, Sparkles } from 'lucide-react';

export const Artists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    setArtists(RaagaDatabase.getArtists());
  }, []);

  // Compute filtering
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          artist.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || 
                        artist.primaryRole.toLowerCase() === selectedRole.toLowerCase() ||
                        artist.roles.some(r => r.toLowerCase() === selectedRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const rolesList = ['All', 'Composer', 'Singer', 'Producer', 'Lyricist'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Discover Artists
          </h1>
          <p className="text-sm text-white/50 font-normal">
            Navigate through composers, instrumental orchestrates, vocalists, and directors.
          </p>
        </div>

        {/* Input tools */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:max-w-md">
          {/* Text search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist name or bio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#181818] border border-white/5 focus:border-[#1DB954]/40 text-sm text-white placeholder-white/30 outline-none transition-all"
            />
          </div>

          {/* Quick role tab selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {rolesList.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedRole === role
                    ? 'bg-[#1DB954] text-black border-transparent shadow shadow-[#1db954]/20'
                    : 'bg-[#121212] text-white/60 hover:text-white border border-white/5 hover:bg-[#181818]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid items */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-24 bg-[#121212] border border-dashed border-white/10 rounded-3xl">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-white text-lg font-semibold">No artists found</h3>
          <p className="text-sm text-white/40 mt-1">Try relaxing your search spelling or role filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredArtists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}

    </div>
  );
};
