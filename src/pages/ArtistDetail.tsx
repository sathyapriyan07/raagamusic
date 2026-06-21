import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RaagaDatabase } from '../services/db';
import { Artist, Song, Album } from '../types';
import { SongCard } from '../components/SongCard';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { SpotifyTable } from '../components/SpotifyTable';
import { Users, Disc, Music, UserCheck, AlertCircle, ArrowLeft, Heart, BookOpen, Layers } from 'lucide-react';

export const ArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'songs' | 'albums'>('overview');

  useEffect(() => {
    if (!id) return;

    const allArtists = RaagaDatabase.getArtists();
    const allSongs = RaagaDatabase.getSongs();
    const allAlbums = RaagaDatabase.getAlbums();

    const currentArtist = allArtists.find(a => a.id === id);
    if (!currentArtist) {
      setArtist(null);
      return;
    }

    setArtist(currentArtist);

    // 1. Fetch songs where artist matches (either primary id or included inside artists list)
    const artistSongs = allSongs.filter(s => s.artists.some(a => a.id === id) || 
                                             s.credits.singer?.some(v => v.includes(currentArtist.name)) || 
                                             s.credits.composer?.some(c => c.includes(currentArtist.name)));
    setSongs(artistSongs);

    // 2. Fetch albums where artist matches
    const artistAlbums = allAlbums.filter(al => al.artists.some(a => a.id === id));
    setAlbums(artistAlbums);

    // 3. Recommended related artists (Spotify-like similar recommended musicians)
    const otherArtists = allArtists.filter(a => a.id !== id);
    setRelatedArtists(otherArtists);

  }, [id]);

  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-white text-xl font-bold">Artist profile can’t be located</h2>
        <p className="text-white/40 text-sm">Please review the lookup URI parameters or configure new artists.</p>
        <button onClick={() => navigate('/artists')} className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm transition-all">
          Back to Artists
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 w-full overflow-hidden">
      {/* 1. Large Cinematic-style Hero Banner & Header */}
      <section className="relative w-full h-[35vh] sm:h-[45vh] lg:h-[50vh] flex items-end">
        {/* Banner image or fallback elegant solid */}
        <div 
          className="absolute inset-0 bg-cover bg-center select-none pointer-events-none filter brightness-50"
          style={{ 
            backgroundImage: `url(${artist.banner || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'})` 
          }}
        />
        {/* Dark bottom gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0acc]/40 to-black/35 z-5" />

        {/* Action controls */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 sm:left-6 lg:left-8 flex items-center gap-1.5 text-xs text-white/50 hover:text-white font-mono bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-colors z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Overlapping Profile Photo Roster layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          
          {/* Circular profile avatar */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-[#0a0a0a] shadow-2xl shrink-0 -mb-6 sm:-mb-4 z-10 bg-[#1e1e1e]">
            <img 
              src={artist.image} 
              alt={artist.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2 mt-4 sm:mt-0">
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none drop-shadow-md">
              {artist.name}
            </h1>
          </div>

        </div>
      </section>

      {/* 2. Overview statistic banners */}
      <section className="bg-[#121212] pt-12 pb-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6">
          
          {/* Metadata counts */}
          <div className="flex flex-wrap gap-x-6 gap-y-4 sm:gap-12">
            <div className="space-y-0.5">
              <p className="text-white/40 text-[10px] font-bold font-mono uppercase tracking-widest leading-none">Indexed Songs</p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-white">{songs.length}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-white/40 text-[10px] font-bold font-mono uppercase tracking-widest leading-none">Cataloged Albums</p>
              <p className="text-xl sm:text-2xl font-display font-extrabold text-white">{albums.length}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Detailed tabular sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Tabs picker navigation */}
        <div className="flex pb-2 overflow-x-auto gap-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b shrink-0 ${activeTab === 'overview' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
          >
            Overview & Bio
          </button>
          <button 
            onClick={() => setActiveTab('songs')}
            className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b shrink-0 ${activeTab === 'songs' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
          >
            Full Songography ({songs.length})
          </button>
          <button 
            onClick={() => setActiveTab('albums')}
            className={`pb-2.5 font-display font-extrabold text-base sm:text-lg transition-colors border-b shrink-0 ${activeTab === 'albums' ? 'text-[#1DB954] border-[#1DB954]' : 'text-white/40 border-transparent hover:text-white'}`}
          >
            Discography ({albums.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW DIALECT */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bio story sheet */}
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-4 shadow">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1DB954]" /> Biography
              </h3>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line font-normal">
                {artist.bio}
              </p>
              <p className="text-[11px] font-mono text-white/40">
                Primary Role: <span className="text-[#1DB954] font-bold">{artist.primaryRole}</span>
              </p>
            </div>

            {/* Top featured hit selections */}
            {songs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-white">Signature Recordings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {songs.slice(0, 4).map(song => (
                    <div key={song.id} className="bg-[#121212] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center gap-3 transition-colors">
                      <img 
                        src={song.artwork} 
                        alt={song.name} 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="truncate flex-1">
                        <Link to={`/song/${song.id}`} className="font-semibold text-white hover:text-[#1DB954] block truncate text-sm">
                          {song.name}
                        </Link>
                        <p className="text-white/30 text-xs font-mono">{song.releaseYear}</p>
                      </div>
                      <span className="text-white/40 text-xs font-mono pr-2">{song.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FULL SONGOGRAPHY TABLE */}
        {activeTab === 'songs' && (
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 sm:p-6 shadow">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-white mb-4">Complete Indexed Tracks</h3>
            <SpotifyTable songs={songs} />
          </div>
        )}

        {/* TAB 3: ALBUMS DISCOGRAPHY GRID */}
        {activeTab === 'albums' && (
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-white">Albums & EP Discographies</h3>
            {albums.length === 0 ? (
              <div className="text-center py-16 text-white/30 bg-[#121212] border border-white/5 rounded-2.5xl">
                No custom compilation albums curated for this artist yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {albums.map(al => (
                  <AlbumCard key={al.id} album={al} />
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      {/* 4. Similar Recommended Artists (Spotify style recommendations) */}
      <section className="border-t border-white/5 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1DB954]" /> Related Artists (Fans Also Discover)
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 ">
            {relatedArtists.map(art => (
              <div key={art.id} className="w-[185px] sm:w-[220px] shrink-0">
                <ArtistCard artist={art} />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
