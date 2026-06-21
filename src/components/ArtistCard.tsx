import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Disc, Music } from 'lucide-react';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link 
      id={`artist-card-${artist.id}`}
      to={`/artist/${artist.id}`} 
      className="group block p-5 bg-[#121212] hover:bg-[#181818] rounded-2.5xl border border-white/5 hover:border-white/10 text-center transition-all duration-300 transform hover:-translate-y-1 relative"
    >
      {/* Circle Profile Pic */}
      <div className="relative aspect-square w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden bg-[#242424] mb-4 shadow-lg shadow-black/40 border border-white/10 group-hover:border-white/20 transition-all">
        <img 
          src={artist.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'} 
          alt={artist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlayer */}
        <div className="absolute inset-0 bg-[#1DB954]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Users className="w-6 h-6 text-[#1DB954]" />
        </div>
      </div>

      {/* Profile info */}
      <div className="space-y-1.5">
        <h3 className="font-sans font-bold text-base text-white truncate max-w-[180px] mx-auto group-hover:text-[#1DB954] transition-colors leading-tight">
          {artist.name}
        </h3>
        
        {/* Role badge */}
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] text-white/60 font-semibold tracking-wider uppercase mb-1.5">
          {artist.primaryRole}
        </div>

        {/* Stats catalog items */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/30 pt-1 border-t border-white/5 max-w-[140px] mx-auto">
          <div className="flex items-center gap-1">
            <Music className="w-3.5 h-3.5" />
            <span>{artist.songCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Disc className="w-3.5 h-3.5" />
            <span>{artist.albumCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
