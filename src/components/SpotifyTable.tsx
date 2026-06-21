import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Music, Clock, ChevronRight } from 'lucide-react';
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
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[500px]">
        {/* Table header */}
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs font-semibold tracking-wider font-mono">
            <th className="py-3 px-4 text-center w-12">#</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Genre</th>
            <th className="py-3 px-4 text-right pr-6 w-24">
              <Clock className="w-4 h-4 inline-block align-text-bottom" />
            </th>
            <th className="py-3 px-4 w-16"></th>
          </tr>
        </thead>

        {/* Table body */}
        <tbody className="divide-y divide-white/5">
          {songs.map((song, index) => (
            <tr 
              key={song.id}
              className="group hover:bg-white/5 transition-colors duration-200 text-sm align-middle"
            >
              {/* Index Column */}
              <td className="py-3.5 px-4 text-center text-white/40 font-mono group-hover:text-white">
                <span className="group-hover:hidden">{song.trackNumber || index + 1}</span>
                <Play className="w-3.5 h-3.5 text-[#1DB954] hidden group-hover:inline-block mx-auto fill-current" />
              </td>

              {/* Title & Artist & Thumb Column */}
              <td className="py-3.5 px-4 flex items-center gap-3">
                <img 
                  src={song.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'} 
                  alt={song.name} 
                  className="w-10 h-10 rounded-lg object-cover shrink-0 shadow border border-white/5"
                  loading="lazy"
                />
                <div className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  <Link 
                    to={`/song/${song.id}`}
                    className="font-semibold text-white group-hover:text-[#1DB954] transition-colors truncate block text-sm sm:text-base"
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

              {/* Genre & Language Column */}
              <td className="py-3.5 px-4 text-white/60">
                <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md group-hover:bg-white/10 transition-colors">
                  {song.genre}
                </span>
                <span className="text-white/30 text-xs ml-2 hidden sm:inline-block">({song.language})</span>
              </td>

              {/* Duration Column */}
              <td className="py-3.5 px-4 text-right pr-6 text-white/40 font-mono text-xs group-hover:text-white">
                {song.duration}
              </td>

              {/* Action Column */}
              <td className="py-3.5 px-4">
                <Link 
                  to={`/song/${song.id}`}
                  className="p-1 px-2.5 bg-white/5 hover:bg-[#1DB954] hover:text-black rounded-lg text-white text-xs transition-colors flex items-center gap-1 group-hover:opacity-100 opacity-60"
                >
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
