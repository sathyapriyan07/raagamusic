import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RaagaDatabase } from '../services/db';
import { Album, Song, Artist } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { SpotifyTable } from '../components/SpotifyTable';
import { Disc, Clock, Calendar, ArrowLeft, HelpCircle, Layers, FileText, Globe, Film } from 'lucide-react';

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
                <span key={art.id}>
                  <Link 
                    to={`/artist/${art.id}`} 
                    className="text-white hover:text-[#1DB954] hover:underline transition-colors font-extrabold"
                  >
                    {art.name}
                  </Link>
                  {i < album.artists.length - 1 && <span className="text-white/40 mx-1.5">&amp;</span>}
                </span>
              ))}
            </div>

            {/* Available Platform references */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {[
                  { key: 'spotify', url: album.streamingLinks?.spotify, logo: '/Spotify_logo_without_text.svg.png', name: 'Spotify' },
                  { key: 'appleMusic', url: album.streamingLinks?.appleMusic, logo: '/Apple_Music.png', name: 'Apple Music' },
                  { key: 'youtubeMusic', url: album.streamingLinks?.youtubeMusic, logo: '/Youtube_Music.png', name: 'YouTube Music' },
                  { key: 'youtube', url: album.streamingLinks?.youtube, logo: '/Youtube_logo.png', name: 'YouTube' },
                  { key: 'jioSaavn', url: album.streamingLinks?.jioSaavn, logo: '/jiosaavn.png', name: 'JioSaavn' },
                  { key: 'amazonMusic', url: album.streamingLinks?.amazonMusic, logo: '/Amazonmusic.png', name: 'Amazon Music' },
                ].filter(p => p.url).map(platform => (
                  <a
                    key={platform.key}
                    href={platform.url!}
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

      {/* 2. Track listings tab sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Center detailed Table Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab headers */}
          <div className="flex pb-2 ml-1 gap-4">
            <button 
              onClick={() => setActiveTab('tracks')}
              className={`pb-2.5 font-display font-semibold text-base sm:text-lg transition-colors border-b ${activeTab === 'tracks' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Track List ({songs.length})
            </button>
            <button 
              onClick={() => setActiveTab('credits')}
              className={`pb-2.5 font-display font-semibold text-base sm:text-lg transition-colors border-b ${activeTab === 'credits' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
            >
              Album Credits
            </button>
          </div>

          {/* TAB 1: DYNAMIC INTERACTIVE TRACKLIST */}
          {activeTab === 'tracks' && (
            <div className="bg-[#121212] rounded-3xl p-3 sm:p-5 shadow">
              <SpotifyTable songs={songs} />
            </div>
          )}

          {/* TAB 2: CREDITS */}
          {activeTab === 'credits' && (
            <div className="bg-[#121212] rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold font-mono uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#1DB954]" /> Album Credits
              </div>

              {(() => {
                const allArtists: { id: string; name: string }[] = songs.flatMap(s => s.artists);
                const songArtists = Array.from(
                  new Map(allArtists.map(a => [a.id, a])).values()
                );
                return (
                  <div className="text-sm">
                    <div className="py-3 sm:grid sm:grid-cols-3 gap-3">
                      <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8 block sm:inline">Album Artists: </span>
                      <span className="font-semibold text-white sm:col-span-2 leading-8 flex flex-wrap items-baseline">
                        {album.artists.map((a, i) => (
                          <React.Fragment key={a.id}>
                            <Link to={`/artist/${a.id}`} className="text-white hover:text-[#1DB954] hover:underline">{a.name}</Link>
                            {i < album.artists.length - 1 ? <span className="mx-1.5 text-white/30">/</span> : ''}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                    <div className="py-3 sm:grid sm:grid-cols-3 gap-3">
                      <span className="font-mono text-white/45 uppercase text-xs font-bold leading-8 block sm:inline">Featured Artists: </span>
                      <span className="font-semibold text-white/70 sm:col-span-2 leading-8 flex flex-wrap items-baseline">
                        {songArtists
                          .filter(a => !album.artists.some(aa => aa.id === a.id))
                          .map((a, i, arr) => (
                            <React.Fragment key={a.id}>
                              <Link to={`/artist/${a.id}`} className="text-white/70 hover:text-[#1DB954] hover:underline">{a.name}</Link>
                              {i < arr.length - 1 ? <span className="mx-1.5 text-white/30">/</span> : ''}
                            </React.Fragment>
                          ))}
                        {songArtists.filter(a => !album.artists.some(aa => aa.id === a.id)).length === 0 && (
                          <span className="text-white/30">Same as album artists</span>
                        )}
                      </span>
                    </div>
                    <div className="py-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-white/40">
                      <span>Released: <span className="text-white/60 font-semibold">{album.releaseDate}</span></span>
                      <span>Total Tracks: <span className="text-white/60 font-semibold">{songs.length}</span></span>
                      <span>Duration: <span className="text-white/60 font-semibold">{totalDurationStr}</span></span>
                    </div>
                  </div>
                );
              })()}
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
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 ">
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
