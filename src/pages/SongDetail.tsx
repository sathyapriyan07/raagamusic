import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RaagaDatabase } from '../services/db';
import { Song, Album, Artist } from '../types';
import { SongCard } from '../components/SongCard';
import { Play, Music, Disc, Info, User, HelpCircle, ArrowLeft, ExternalLink, Library, Film, Heart } from 'lucide-react';

function extractYoutubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const SongDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  
  // Cross relational collections
  const [sameAlbumSongs, setSameAlbumSongs] = useState<Song[]>([]);
  const [sameArtistSongs, setSameArtistSongs] = useState<Song[]>([]);

  // Navigation tab layout states
  const [activeTab, setActiveTab] = useState<'credits' | 'video'>('credits');

  useEffect(() => {
    if (!id) return;

    const songs = RaagaDatabase.getSongs();
    const albums = RaagaDatabase.getAlbums();
    const artists = RaagaDatabase.getArtists();

    const currentSong = songs.find(s => s.id === id);
    if (!currentSong) {
      setSong(null);
      return;
    }

    setSong(currentSong);

    // Fetch album details
    if (currentSong.albumId) {
      const matchAlbum = albums.find(al => al.id === currentSong.albumId);
      setAlbum(matchAlbum || null);
    } else {
      setAlbum(null);
    }

    // Fetch primary artist details
    const primaryArtistRef = currentSong.artists[0];
    if (primaryArtistRef) {
      const matchArtist = artists.find(ar => ar.id === primaryArtistRef.id);
      setArtist(matchArtist || null);
    } else {
      setArtist(null);
    }

    // Related content 1: More songs in this album
    if (currentSong.albumId) {
      const albumSongs = songs.filter(s => s.albumId === currentSong.albumId && s.id !== currentSong.id);
      setSameAlbumSongs(albumSongs);
    } else {
      setSameAlbumSongs([]);
    }

    // Related content 2: More tracks from this principal artist
    if (primaryArtistRef) {
      const artistSongs = songs.filter(s => s.artists.some(a => a.id === primaryArtistRef.id) && s.id !== currentSong.id);
      setSameArtistSongs(artistSongs);
    } else {
      setSameArtistSongs([]);
    }

  }, [id]);

  if (!song) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-white text-xl font-bold">Metadata Record Not Found</h2>
        <p className="text-white/40 text-sm">The song ID might be incorrect or removed from Raaga local databases.</p>
        <button onClick={() => navigate('/songs')} className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm transition-all">
          Back to Songs
        </button>
      </div>
    );
  }

  const creditRows = [
    { label: 'Singer / Vocalist', people: song.credits.singer ?? [], className: 'hover:border-[#1DB954] hover:text-[#1DB954]' },
    { label: 'Composer / Arranger', people: song.credits.composer ?? [], className: 'hover:border-[#1DB954] hover:text-[#1DB954]' },
    { label: 'Lyricist / Writer', people: song.credits.lyricist ?? [], className: 'hover:border-[#1DB954] hover:text-[#1DB954]' },
    { label: 'Executive Producer', people: song.credits.producer ?? [], className: 'text-white/70' },
    { label: 'Director / Conductor', people: song.credits.musicDirector ?? [], className: 'text-[#1DB954] font-bold' },
  ].filter(row => row.people.length > 0);

  const streamPlatforms = [
    { name: 'Spotify', key: 'spotify', url: song.streamingLinks?.spotify, logo: '/Spotify_logo_without_text.svg.png' },
    { name: 'Apple Music', key: 'appleMusic', url: song.streamingLinks?.appleMusic, logo: '/Apple_Music.png' },
    { name: 'YouTube Music', key: 'youtubeMusic', url: song.streamingLinks?.youtubeMusic, logo: '/Youtube_Music.png' },
    { name: 'YouTube', key: 'youtube', url: song.streamingLinks?.youtube, logo: '/Youtube_logo.png' },
    { name: 'JioSaavn', key: 'jioSaavn', url: song.streamingLinks?.jioSaavn || `https://www.jiosaavn.com/search/${encodeURIComponent(song.name)}`, logo: '/jiosaavn.png' },
    { name: 'Amazon Music', key: 'amazonMusic', url: song.streamingLinks?.amazonMusic || `https://music.amazon.com/search/${encodeURIComponent(song.name)}`, logo: '/Amazonmusic.png' }
  ];

  return (
    <div className="pb-28">
      {/* 1. Blurred Artwork Header Hero */}
      <section className="relative w-full py-12 md:py-20 flex items-center overflow-hidden border-b border-white/5">
        
        {/* Layer 1: Backdrop artwork blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30 select-none pointer-events-none"
          style={{ backgroundImage: `url(${song.artwork})` }}
        />
        {/* Layer 2: Black dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0acc]/70 to-[#0a0a0a]/50 z-5" />

        {/* Layer 3: Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center md:items-end gap-8 sm:gap-12">
          
          {/* Back Action Trigger */}
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:left-8 flex items-center gap-1.5 text-xs text-white/40 hover:text-white font-mono transition-colors z-20"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {/* Front Cover Artwork Card */}
          <div className="w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 shrink-0">
            <img 
              src={song.artwork} 
              alt={song.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Particulars Card */}
          <div className="flex-1 text-center md:text-left space-y-4">
            
            {song.explicit && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-extrabold tracking-widest uppercase font-mono">
                  EXPLICIT
                </span>
              </div>
            )}

            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              {song.name}
            </h1>

            {/* Performers */}
            <div className="text-base sm:text-lg md:text-xl text-white/80 font-medium">
              by{' '}
              {song.artists.map((art, i) => (
                <span key={art.id}>
                  <Link 
                    to={`/artist/${art.id}`} 
                    className="text-white hover:text-[#1DB954] hover:underline font-bold transition-colors"
                  >
                    {art.name}
                  </Link>
                  {i < song.artists.length - 1 && <span className="text-white/40 mx-1.5">&amp;</span>}
                </span>
              ))}
            </div>

            {/* Album meta context details */}
            <p className="text-xs sm:text-sm text-white/40 font-mono flex flex-wrap justify-center md:justify-start items-center gap-1">
              <span>Album:</span> 
              {album ? (
                <Link to={`/album/${album.id}`} className="text-white/60 hover:text-white hover:underline font-bold">
                  {song.albumName}
                </Link>
              ) : (
                <span className="text-white/60">Single Release</span>
              )}
            </p>

            {/* External Streaming Platform references */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {streamPlatforms.filter(p => p.url).map((platform) => (
                  <a
                    key={platform.key}
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all bg-white/5 hover:bg-white/10"
                    title={platform.name}
                  >
                    <img src={platform.logo} alt={platform.name} className="w-5 h-5 object-contain" />
                    <span className="text-xs font-medium text-white/80">{platform.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Detail tabs, credits table, parameters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left/Center Column for tabs contents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab buttons */}
          <div className="flex border-b border-white/5 pb-2 ml-1 overflow-x-auto gap-4">
            <button 
              onClick={() => setActiveTab('credits')}
              className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b shrink-0 ${activeTab === 'credits' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Roster & Credits
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b shrink-0 ${activeTab === 'video' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Video Feature
            </button>
          </div>

          {/* TAB 1: IMMENSE ROSTER TABLE */}
          {activeTab === 'credits' && (
            <div className="bg-[#121212] border border-white/5 rounded-2.5xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 font-mono text-xs text-white/50 font-bold uppercase tracking-wider">
                Roster & Production Credits
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-white/5">
                  {creditRows.length > 0 ? (
                    creditRows.map(row => (
                      <tr key={row.label} className="align-top hover:bg-white/5 transition-colors">
                        <td className="p-4 w-1/3 text-xs font-bold uppercase tracking-wider text-white/40 font-mono">{row.label}</td>
                        <td className="p-4 text-sm font-semibold text-white">
                          <div className="flex flex-wrap gap-2">
                            {row.people.map((person, idx) => (
                              <span key={`${row.label}-${person}-${idx}`} className={`bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 transition-colors ${row.className}`}>
                                {person}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-sm text-white/25 font-mono">No roster credits assigned.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-white/5 flex flex-wrap gap-4 text-xs font-mono text-white/40">
                <span>Duration: <span className="text-white/60 font-bold">{song.duration}</span></span>
                <span>Release Date: <span className="text-white/60 font-bold">{song.releaseDate}</span></span>
              </div>
            </div>
          )}

          {/* TAB 3: RESPONSIVE YOUTUBE EMBED CONTAINER */}
          {activeTab === 'video' && (() => {
            const resolvedVideoId = extractYoutubeId(song.streamingLinks?.youtube) || song.youtubeVideoId;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/40 text-xs font-bold font-mono uppercase tracking-wider">
                  <Film className="w-4 h-4 text-[#1DB954]" /> Official Music/Score Video
                </div>
                
                {resolvedVideoId ? (
                  <div className="relative aspect-video w-full rounded-2.5xl overflow-hidden shadow-2xl border border-white/5 bg-black">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube-nocookie.com/embed/${resolvedVideoId}?rel=0&showinfo=0`}
                      title={`Video for ${song.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center text-white/40 bg-[#121212] border border-white/5 rounded-2.5xl font-mono text-sm">
                    No official music video synced for this song. Search iTunes/TMDB to bind backdrop videos or set YouTube URL.
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {/* Sidebar for quick details, credits, info */}
        <div className="space-y-6">
          {/* Linked artist details profile card */}
          {artist && (
            <div className="p-5 bg-[#121212] border border-white/5 rounded-2.5xl space-y-3 shadow">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1DB954] font-mono">
                Primary Conductor Profile
              </p>
              
              <div className="flex items-center gap-3">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-display font-extrabold text-sm text-white hover:text-[#1DB954] transition-colors leading-tight">
                    <Link to={`/artist/${artist.id}`}>{artist.name}</Link>
                  </h4>
                  <p className="text-[10px] font-bold text-white/50 tracking-wide uppercase font-mono">{artist.primaryRole}</p>
                </div>
              </div>

              <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                {artist.bio}
              </p>

              <div className="pt-2">
                <Link 
                  to={`/artist/${artist.id}`}
                  className="w-full text-center py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white text-xs font-bold transition-all block"
                >
                  View Discography
                </Link>
              </div>
            </div>
          )}


        </div>

      </section>

      {/* 3. Related Horizontal Scroll sections */}
      <section className="border-t border-white/5 pt-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Roster Row A: More tracks from this Album */}
          {sameAlbumSongs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                <Disc className="w-5 h-5 text-[#1DB954]" /> More Songs from Album
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 ">
                {sameAlbumSongs.map(s => (
                  <div key={s.id} className="w-[185px] sm:w-[220px] shrink-0">
                    <SongCard song={s} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roster Row B: More tracks from this Principal Artist */}
          {sameArtistSongs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-[#1DB954]" /> Other Discoveries by {artist?.name || 'Artist'}
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 ">
                {sameArtistSongs.map(s => (
                  <div key={s.id} className="w-[185px] sm:w-[220px] shrink-0">
                    <SongCard song={s} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
