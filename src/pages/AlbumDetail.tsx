import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RaagaDatabase } from '../services/db';
import { Album, Song, Artist } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { SpotifyTable } from '../components/SpotifyTable';
import { Disc, Clock, Calendar, ArrowLeft, ExternalLink, HelpCircle, Layers, FileText, Globe, Film } from 'lucide-react';

function extractYoutubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const AlbumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [relatedAlbums, setRelatedAlbums] = useState<Album[]>([]);
  
  const [activeTab, setActiveTab] = useState<'tracks' | 'credits'>('tracks');

  useEffect(() => {
    if (!id) return;

    const albums = RaagaDatabase.getAlbums();
    const allSongs = RaagaDatabase.getSongs();
    const artists = RaagaDatabase.getArtists();

    const currentAlbum = albums.find(al => al.id === id);
    if (!currentAlbum) {
      setAlbum(null);
      return;
    }

    setAlbum(currentAlbum);

    // Filter physical track listings mapped inside album.trackIds
    const filteredSongs = allSongs.filter(song => song.albumId === id || currentAlbum.trackIds.includes(song.id));
    // Sort songs by trackNumber to ensure professional indexing
    const sortedSongs = [...filteredSongs].sort((a, b) => a.trackNumber - b.trackNumber);
    setSongs(sortedSongs);

    // Resolve principal artist biography details
    const principalArtistRef = currentAlbum.artists[0];
    if (principalArtistRef) {
      const matchArtist = artists.find(a => a.id === principalArtistRef.id);
      setArtist(matchArtist || null);

      // Fetch other albums by this artist (for Related Albums)
      const otherAlbums = albums.filter(al => al.artists.some(a => a.id === principalArtistRef.id) && al.id !== currentAlbum.id);
      setRelatedAlbums(otherAlbums);
    } else {
      setArtist(null);
      setRelatedAlbums([]);
    }

  }, [id]);

  if (!album) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-white text-xl font-bold">Album Profile Not Found</h2>
        <p className="text-white/40 text-sm">The album ID might be incorrect or removed from Raaga database.</p>
        <button onClick={() => navigate('/albums')} className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm transition-all">
          Back to Discography
        </button>
      </div>
    );
  }

  // Count total minutes sum from songs list
  const totalDurationStr = album.runtime || '45 mins';

  return (
    <div className="pb-28">
      {/* 1. Spotify Rounded Banner with Ambient backdrop filters */}
      <section className="relative w-full py-12 md:py-20 flex items-center overflow-hidden border-b border-white/5">
        
        {/* Blurred wallpaper overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-25 select-none pointer-events-none"
          style={{ backgroundImage: `url(${album.artwork})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0acc]/85 to-[#0a0a0a]/50 z-5" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center md:items-end gap-8 sm:gap-12">
          
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:left-8 flex items-center gap-1.5 text-xs text-white/40 hover:text-white font-mono transition-colors z-20"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {/* Album artwork */}
          <div className="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl shadow-black/85 border border-white/10 shrink-0">
            <img 
              src={album.artwork} 
              alt={album.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata particulars */}
          <div className="flex-1 text-center md:text-left space-y-4">
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1 font-mono">
                {album.type.toUpperCase()} RELEASE
              </span>
              <span className="text-white/40 text-xs font-mono">{album.genre}</span>
              <span className="text-white/45 text-xs font-mono">• {album.language} Origin</span>
            </div>

            {/* Support TMDB stylised album logo represented dynamically */}
            {album.logoUrl ? (
              <div className="py-2.5">
                <img 
                  src={album.logoUrl} 
                  alt={album.name} 
                  className="max-h-20 max-w-[320px] sm:max-w-[480px] object-contain object-left mx-auto md:mx-0 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                />
              </div>
            ) : (
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none">
                {album.name}
              </h1>
            )}

            {/* Performers creators */}
            <div className="text-base sm:text-lg md:text-xl text-white/90 font-medium">
              by{' '}
              {album.artists.map((art, i) => (
                <Link 
                  key={art.id} 
                  to={`/artist/${art.id}`} 
                  className="text-white hover:text-[#1DB954] hover:underline transition-colors font-extrabold"
                >
                  {art.name}
                </Link>
              ))}
            </div>

            {/* Brief list parameters */}
            <p className="text-xs sm:text-sm text-white/40 font-mono">
              Released: <span className="text-white/60">{album.releaseDate}</span> • Total Tracks: <span className="text-white/60">{songs.length} indexed</span> • Sum Duration: <span className="text-white/60">{totalDurationStr}</span>
            </p>

            {/* Available Platform references */}
            <div className="pt-2">
              <p className="text-[10px] sm:text-xs font-bold text-white/30 uppercase tracking-widest font-mono mb-2">
                External Disc Repositories (Metadata Only)
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {album.streamingLinks?.spotify && (
                  <a 
                    href={album.streamingLinks.spotify}
                    target="_blank"
                    rel="noreferrer referrerPolicy"
                    className="px-3.5 py-1.5 rounded-lg bg-[#1DB954] text-black hover:bg-[#1ed760] text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Spotify LP</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {album.streamingLinks?.appleMusic && (
                  <a 
                    href={album.streamingLinks.appleMusic}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-[#FC3C44] text-white hover:bg-[#ff4e55] text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Apple Music</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {album.streamingLinks?.youtube && (
                  <a 
                    href={album.streamingLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-[#FF0000] text-white hover:bg-[#cc0000] text-xs font-bold transition-all flex items-center gap-1.5 border border-red-600/30"
                  >
                    <span>YouTube Video</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a 
                  href={`https://music.youtube.com/search?q=${encodeURIComponent(album.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-[#FF0000] text-white hover:bg-[#ff1b1b] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>YT Music</span> <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Track listings tab sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Center detailed Table Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab headers */}
          <div className="flex border-b border-white/5 pb-2 ml-1 gap-4">
            <button 
              onClick={() => setActiveTab('tracks')}
              className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b ${activeTab === 'tracks' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Track List ({songs.length})
            </button>
            <button 
              onClick={() => setActiveTab('credits')}
              className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b ${activeTab === 'credits' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Album Credits
            </button>
          </div>

          {/* TAB 1: DYNAMIC INTERACTIVE TRACKLIST */}
          {activeTab === 'tracks' && (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-3 sm:p-5 shadow">
              <SpotifyTable songs={songs} />
            </div>
          )}

          {/* TAB 2: CREDITS */}
          {activeTab === 'credits' && (
            <div className="bg-[#121212] border border-white/5 rounded-2.5xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold font-mono uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#1DB954]" /> Studio Staff and Engineers Listings
              </div>
              
              <div className="divide-y divide-white/5 text-sm">
                <div className="py-3 sm:grid sm:grid-cols-3">
                  <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8">Producer</span>
                  <span className="font-semibold text-white sm:col-span-2 leading-8">
                    {album.credits?.producer?.join(', ') || artist?.name || 'Studio Production'}
                  </span>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3">
                  <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8">Primary Composers</span>
                  <span className="font-semibold text-white sm:col-span-2 leading-8">
                    {album.credits?.composers?.join(', ') || artist?.name || 'Traditional Composer Score'}
                  </span>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3">
                  <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8">Mixing & Mastering Staff</span>
                  <span className="font-semibold text-white sm:col-span-2 leading-8">
                    {album.credits?.engineers?.join(', ') || 'Naveen Kumar, P.A. Deepak, Leslie Fernandes'}
                  </span>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3">
                  <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8">Recording Network</span>
                  <span className="font-semibold text-white sm:col-span-2 leading-8">
                    KM Music Conservatory Studios, Panchathan Record Inn (Chennai, TN)
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Album Video Trailer/Teaser Playback */}
          {(() => {
            const videoId = extractYoutubeId(album.streamingLinks?.youtube);
            if (!videoId) return null;
            return (
              <div className="p-5 bg-[#121212] border border-white/5 rounded-2.5xl space-y-3.5 shadow">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1DB954] font-mono leading-tight flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Official Album Promo
                </p>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0`}
                    title={`Video for ${album.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0"
                  />
                </div>
              </div>
            );
          })()}

          {/* Main performer reference bios */}
          {artist && (
            <div className="p-5 bg-[#121212] border border-white/5 rounded-2.5xl space-y-3 shadow">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-16 h-16 rounded-full object-cover border border-white/10"
              />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1DB954] font-mono leading-tight">
                COMPOSER SPOTLIGHT biography
              </p>
              
              <h4 className="font-display font-extrabold text-[#1DB954] text-base hover:underline">
                <Link to={`/artist/${artist.id}`}>{artist.name}</Link>
              </h4>

              <p className="text-xs text-white/60 leading-relaxed line-clamp-4">
                {artist.bio}
              </p>

              <div className="pt-2">
                <Link 
                  to={`/artist/${artist.id}`}
                  className="w-full text-center py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-bold transition-all block"
                >
                  Explore Full Music Profile
                </Link>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* 3. Related Albums rows */}
      {relatedAlbums.length > 0 && (
        <section className="border-t border-white/5 pt-10 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
              <Disc className="w-5 h-5 text-[#1DB954]" /> More Albums from {artist?.name || 'Artist'}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin">
              {relatedAlbums.map(al => (
                <div key={al.id} className="w-[185px] sm:w-[220px] shrink-0">
                  <AlbumCard album={al} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
