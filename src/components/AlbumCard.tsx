import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Disc } from 'lucide-react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/album/${album.id}`);
  };

  return (
    <div 
      id={`album-card-${album.id}`}
      onClick={handleCardClick}
      className="group block p-4 bg-[#121212] hover:bg-[#181818] rounded-2.5xl border border-white/5 hover:border-white/10 transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer"
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#242424] mb-4 shadow-lg shadow-black/30">
        <img 
          src={album.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'} 
          alt={album.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />


        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center translate-y-3 group-hover:translate-y-0 transition-all duration-350 shadow-xl shadow-black/45">
            <Disc className="w-5 h-5 text-black animate-spin-slow stroke-[2]" />
          </div>
        </div>

        {/* Album Type indicator */}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
          {album.type}
        </span>
      </div>

      {/* Album Particulars */}
      <div className="space-y-1.5">
        <h3 className="font-sans font-semibold text-sm sm:text-base text-white truncate group-hover:text-[#1DB954] transition-colors leading-tight">
          {album.name}
        </h3>

        <p className="text-xs text-white/50 truncate">
          by{' '}
          {album.artists.map((ar, i) => (
            <span key={ar.id} className="hover:underline hover:text-white transition-colors" onClick={(e) => {
              e.stopPropagation();
            }}>
              <Link to={`/artist/${ar.id}`}>{ar.name}</Link>
              {i < album.artists.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        <div className="text-[11px] font-mono text-white/30 pt-0.5">
          <span>{album.releaseYear}</span>
        </div>
      </div>
    </div>
  );
};
