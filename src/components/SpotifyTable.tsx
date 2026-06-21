import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Song } from '../types';

interface SpotifyTableProps {
  songs: Song[];
}

export const SpotifyTable: React.FC<SpotifyTableProps> = ({ songs }) => {
  if (songs.length === 0) {
    return (
      <div className="py-12 text-center text-white/40 font-mono text-sm">
        No songs listed in this item.
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        {/* Table body */}
        <tbody>
          {songs.map((song, index) => (
            <tr 
              key={song.id}
              className="text-sm align-middle"
            >
              {/* Index + Title + Duration inline */}
              <td className="py-2.5 pr-2 text-center text-white/40 font-mono text-xs w-8 align-top pt-3.5">
                {song.trackNumber || index + 1}
              </td>
              <td className="py-2.5 flex items-center gap-2.5 min-w-0">
                <img 
                  src={song.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'} 
                  alt={song.name} 
                  className="w-9 h-9 rounded-lg object-cover shrink-0 shadow"
                  loading="lazy"
                />
                <div className="truncate min-w-0 flex-1">
                  <Link 
                    to={`/song/${song.id}`}
                    className="font-semibold text-white hover:text-[#1DB954] transition-colors truncate block text-sm"
                  >
                    {song.name}
                  </Link>
                  <p className="text-white/50 text-xs truncate mt-0.5">
                    {song.artists.map((ar, i) => (
                      <span key={ar.id} className="hover:underline hover:text-white transition-colors">
                        <Link to={`/artist/${ar.id}`}>{ar.name}</Link>
                        {i < song.artists.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {song.explicit && (
                      <span className="ml-2 px-1 rounded bg-white/10 text-[9px] font-extrabold text-white/60">E</span>
                    )}
                  </p>
                </div>
              </td>
              <td className="py-2.5 pl-2 text-right text-white/40 font-mono text-xs whitespace-nowrap align-top pt-3.5">
                {song.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
