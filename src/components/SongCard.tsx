import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, Music, Heart, Calendar } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
}

export const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/song/${song.id}`);
  };

  return (
    <div 
      id={`song-card-${song.id}`}
      onClick={handleCardClick}
      className="group block p-4 bg-[#121212] hover:bg-[#181818] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#242424] mb-4 shadow-lg shadow-black/30">
        <img 
          src={song.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'} 
          alt={song.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Decorative Play Button on Hover */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center translate-y-3 group-hover:translate-y-0 transition-all duration-350 shadow-xl shadow-black/45">
            {/* View Meta Info Arrow/Icon */}
            <Music className="w-5 h-5 text-black fill-current stroke-[2]" />
          </div>
        </div>

        {/* Explicit Tag */}
        {song.explicit && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur text-[8px] font-bold text-yellow-500 uppercase tracking-wider">
            Explicit
          </span>
        )}
      </div>

      {/* Song particulars */}
      <div className="space-y-1.5">
        <h3 className="font-sans font-semibold text-sm sm:text-base text-white truncate group-hover:text-[#1DB954] transition-colors leading-tight">
          {song.name}
        </h3>
        
        <p className="text-xs text-white/50 truncate">
          {song.artists.map((ar, i) => (
            <span key={ar.id} className="hover:underline hover:text-white transition-colors" onClick={(e) => {
              e.stopPropagation();
            }}>
              <Link to={`/artist/${ar.id}`}>{ar.name}</Link>
              {i < song.artists.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] sm:text-xs font-mono text-white/30 truncate max-w-[110px]">
            {song.albumName || 'Single'}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-white/30 shrink-0">
            {song.releaseYear}
          </span>
        </div>
      </div>
    </div>
  );
};
