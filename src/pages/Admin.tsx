import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  RaagaDatabase, 
  searchITunesSongs, 
  searchITunesAlbums, 
  importSongIntoDatabase, 
  importAlbumIntoDatabase,
  searchTMDBLogos,
  uploadArtistFile,
  ITunesSongResult,
  ITunesAlbumResult,
  TMDBLogoResult
} from '../services/db';
import { Song, Album, Artist, CuratedSection, RecentNotification } from '../types';
import { 
  Sliders, 
  ShieldAlert, 
  Download, 
  Search, 
  Disc, 
  Music, 
  Users, 
  Layers, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  Plus, 
  Trash2,
  Lock,
  Globe,
  Pencil,
  X,
  ExternalLink,
  Save,
  Link2,
  Upload
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  
  // Database local states
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [curated, setCurated] = useState<CuratedSection[]>([]);
  const [logs, setLogs] = useState<RecentNotification[]>([]);

  // Menu Navigation Tabs of Admin Panel
  const [adminTab, setAdminTab ] = useState<'dashboard' | 'songs' | 'albums' | 'artists' | 'import-songs' | 'import-albums' | 'tmdb' | 'collections' | 'streaming-links'>('dashboard');

  // Dedicated Streaming Link Editor States
  const [selectedLinkItem, setSelectedLinkItem] = useState<{ type: 'song' | 'album'; id: string } | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [linkTypeFilter, setLinkTypeFilter] = useState<'all' | 'songs' | 'albums'>('all');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [youtubeMusicUrl, setYoutubeMusicUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [jioSaavnUrl, setJioSaavnUrl] = useState('');
  const [amazonMusicUrl, setAmazonMusicUrl] = useState('');

  // Search Filters for Catalog CRUD Lists
  const [songSearchFilter, setSongSearchFilter] = useState('');
  const [albumSearchFilter, setAlbumSearchFilter] = useState('');
  const [artistSearchFilter, setArtistSearchFilter] = useState('');

  const [creditSearchQueries, setCreditSearchQueries] = useState<Record<keyof Song['credits'], string>>({
    singer: '',
    composer: '',
    lyricist: '',
    producer: '',
    musicDirector: '',
  });

  // Song CRUD Editing / Creating States
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isCreatingSong, setIsCreatingSong] = useState(false);

  // Album CRUD Editing / Creating States
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  // Artist CRUD Editing / Creating States
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Template generators for creating new elements
  const getBlankSong = (): Song => ({
    id: `song-${Date.now()}`,
    name: '',
    albumId: '',
    albumName: '',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    artists: [],
    duration: '3:30',
    explicit: false,
    releaseDate: new Date().toISOString().split('T')[0],
    releaseYear: new Date().getFullYear(),
    genre: 'Pop',
    language: 'English',
    youtubeVideoId: '',
    trackNumber: 1,
    credits: {
      singer: [],
      composer: [],
      lyricist: [],
      producer: [],
      musicDirector: []
    },
    streamingLinks: {
      spotify: '',
      appleMusic: '',
      youtubeMusic: '',
      jioSaavn: '',
      amazonMusic: ''
    }
  });

  const getBlankAlbum = (): Album => ({
    id: `album-${Date.now()}`,
    name: '',
    artists: [],
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    logoUrl: '',
    releaseYear: new Date().getFullYear(),
    releaseDate: new Date().toISOString().split('T')[0],
    genre: 'Pop',
    language: 'English',
    type: 'album',
    trackIds: [],
    runtime: '45 mins',
    streamingLinks: {
      spotify: '',
      appleMusic: '',
      youtubeMusic: '',
      jioSaavn: '',
      amazonMusic: ''
    }
  });

  const getBlankArtist = (): Artist => ({
    id: `artist-${Date.now()}`,
    name: '',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    banner: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200',
    primaryRole: 'Soloist',
    bio: '',
    roles: ['Singer'],
    songCount: 0,
    albumCount: 0
  });

  const peopleToText = (people?: string[]) => (people ?? []).join(', ');

  const textToPeople = (value: string) =>
    value
      .split(',')
      .map(person => person.trim())
      .filter(Boolean);

  const updateSongCredit = (field: keyof Song['credits'], value: string) => {
    if (!editingSong) return;

    setEditingSong({
      ...editingSong,
      credits: {
        ...(editingSong.credits ?? {}),
        [field]: textToPeople(value),
      },
    });
  };

  const addSongCredit = (field: keyof Song['credits'], name: string) => {
    if (!editingSong) return;

    const existing = editingSong.credits?.[field] ?? [];
    if (existing.some(person => person.toLowerCase() === name.toLowerCase())) return;

    setEditingSong({
      ...editingSong,
      credits: {
        ...(editingSong.credits ?? {}),
        [field]: [...existing, name],
      },
    });
    setCreditSearchQueries(prev => ({ ...prev, [field]: '' }));
  };

  const removeSongCredit = (field: keyof Song['credits'], name: string) => {
    if (!editingSong) return;

    setEditingSong({
      ...editingSong,
      credits: {
        ...(editingSong.credits ?? {}),
        [field]: (editingSong.credits?.[field] ?? []).filter(person => person !== name),
      },
    });
  };

  const getCreditArtistMatches = (field: keyof Song['credits']) => {
    const query = creditSearchQueries[field].trim().toLowerCase();
    if (!query) return [];

    const assigned = new Set((editingSong?.credits?.[field] ?? []).map(person => person.toLowerCase()));
    return artists
      .filter(artist => artist.name.toLowerCase().includes(query) && !assigned.has(artist.name.toLowerCase()))
      .slice(0, 5);
  };

  const renderCreditEditor = (field: keyof Song['credits'], label: string, placeholder: string) => {
    if (!editingSong) return null;

    const matches = getCreditArtistMatches(field);
    const assigned = editingSong.credits?.[field] ?? [];

    return (
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-white/45">{label}</span>
        <input
          type="text"
          value={peopleToText(assigned)}
          onChange={(e) => updateSongCredit(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1DB954]" />
          <input
            type="text"
            value={creditSearchQueries[field]}
            onChange={(e) => setCreditSearchQueries(prev => ({ ...prev, [field]: e.target.value }))}
            placeholder="Search existing artists to assign..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#101010] border border-white/5 outline-none text-xs text-white placeholder-white/25 focus:border-[#1DB954]/50"
          />
        </div>

        {matches.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5">
            {matches.map(artist => (
              <button
                key={`${field}-${artist.id}`}
                type="button"
                onClick={() => addSongCredit(field, artist.name)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-[#1DB954]/10 border border-white/5 hover:border-[#1DB954]/30 text-left transition-colors"
              >
                <img src={artist.image} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[11px] text-white/80 font-semibold truncate">{artist.name}</span>
                <Plus className="w-3.5 h-3.5 text-[#1DB954] ml-auto" />
              </button>
            ))}
          </div>
        )}

        {assigned.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {assigned.map(person => (
              <button
                key={`${field}-${person}`}
                type="button"
                onClick={() => removeSongCredit(field, person)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 text-[11px] text-white/80"
                title="Remove credit"
              >
                {person}
                <X className="w-3 h-3 text-white/35" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // iTunes Song Import States
  const [songSearchTerm, setSongSearchTerm] = useState('');
  const [songResults, setSongResults] = useState<ITunesSongResult[]>([]);
  const [isSongSearching, setIsSongSearching] = useState(false);
  const [importingSongId, setImportingSongId] = useState<number | null>(null);

  // iTunes Album Import States
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');
  const [albumResults, setAlbumResults] = useState<ITunesAlbumResult[]>([]);
  const [isAlbumSearching, setIsAlbumSearching] = useState(false);
  const [importingAlbumId, setImportingAlbumId] = useState<number | null>(null);

  // TMDB Logo Integration States
  const [selectedAlbumIdForLogo, setSelectedAlbumIdForLogo] = useState('');
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<TMDBLogoResult[]>([]);
  const [isTmdbSearching, setIsTmdbSearching] = useState(false);
  const [tmdbApiKey, setTmdbApiKey] = useState(import.meta.env.VITE_TMDB_API_KEY || '');
  
  // Curator Sections Editing States
  const [newRowTitle, setNewRowTitle] = useState('');
  const [selectedCurRowId, setSelectedCurRowId] = useState('');
  const [itemsToAddToRow, setItemsToAddToRow] = useState<{ type: 'song' | 'album' | 'artist'; id: string }[]>([]);

  // Status message
  const [operationSuccess, setOperationSuccess] = useState('');

  // Reload local state bindings
  const reloadData = () => {
    setSongs(RaagaDatabase.getSongs());
    setAlbums(RaagaDatabase.getAlbums());
    setArtists(RaagaDatabase.getArtists());
    setCurated(RaagaDatabase.getCurated());
    setLogs(RaagaDatabase.getLogs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner shadow-rose-500/5 animate-bounce">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-white">Administrator Privileges Required</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            The database control deck holds core relational curation panels, custom iTunes indexers, and TMDB logos bindings. Standard accounts are denied access.
          </p>
        </div>
      </div>
    );
  }

  // CRUD Actions: SONGS
  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    if (!editingSong.name.trim()) {
      alert('Song name is required!');
      return;
    }

    const currentSongs = RaagaDatabase.getSongs();
    let updated: Song[];

    const songToSave = {
      ...editingSong,
      releaseYear: Number(editingSong.releaseYear) || new Date().getFullYear(),
      trackNumber: Number(editingSong.trackNumber) || 1,
    };

    if (isCreatingSong) {
      if (currentSongs.some(s => s.id === songToSave.id)) {
        alert('A song with this ID already exists!');
        return;
      }
      updated = [...currentSongs, songToSave];
      RaagaDatabase.addLog(`Created new song: "${songToSave.name}"`, 'add');
      setOperationSuccess(`Success: "${songToSave.name}" song created!`);
    } else {
      updated = currentSongs.map(s => s.id === songToSave.id ? songToSave : s);
      RaagaDatabase.addLog(`Updated song details: "${songToSave.name}"`, 'edit');
      setOperationSuccess(`Success: "${songToSave.name}" song details updated!`);
    }

    if (songToSave.albumId) {
      const activeAlbums = RaagaDatabase.getAlbums();
      const targetAlbum = activeAlbums.find(al => al.id === songToSave.albumId);
      if (targetAlbum) {
        songToSave.albumName = targetAlbum.name;
        if (!targetAlbum.trackIds.includes(songToSave.id)) {
          targetAlbum.trackIds.push(songToSave.id);
          RaagaDatabase.saveAlbums(activeAlbums);
        }
      }
    }

    RaagaDatabase.saveSongs(updated);
    setEditingSong(null);
    setIsCreatingSong(false);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  const handleDeleteSong = (songId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the song "${name}"? This action cannot be undone.`)) {
      return;
    }

    const currentSongs = RaagaDatabase.getSongs();
    const filteredSongs = currentSongs.filter(s => s.id !== songId);
    RaagaDatabase.saveSongs(filteredSongs);

    const currentAlbums = RaagaDatabase.getAlbums();
    const updatedAlbums = currentAlbums.map(album => {
      if (album.trackIds.includes(songId)) {
        return {
          ...album,
          trackIds: album.trackIds.filter(id => id !== songId)
        };
      }
      return album;
    });
    RaagaDatabase.saveAlbums(updatedAlbums);

    const currentCurated = RaagaDatabase.getCurated();
    const updatedCurated = currentCurated.map(sect => {
      if (sect.itemIds.some(item => item.id === songId && item.type === 'song')) {
        return {
          ...sect,
          itemIds: sect.itemIds.filter(item => !(item.id === songId && item.type === 'song'))
        };
      }
      return sect;
    });
    RaagaDatabase.saveCurated(updatedCurated);

    RaagaDatabase.addLog(`Deleted song: "${name}"`, 'edit');
    setOperationSuccess(`Song "${name}" deleted successfully.`);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // CRUD Actions: ALBUMS
  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;
    if (!editingAlbum.name.trim()) {
      alert('Album name is required!');
      return;
    }

    const currentAlbums = RaagaDatabase.getAlbums();
    let updated: Album[];

    const albumToSave = {
      ...editingAlbum,
      releaseYear: Number(editingAlbum.releaseYear) || new Date().getFullYear(),
    };

    if (isCreatingAlbum) {
      if (currentAlbums.some(al => al.id === albumToSave.id)) {
        alert('An album with this ID already exists!');
        return;
      }
      updated = [...currentAlbums, albumToSave];
      RaagaDatabase.addLog(`Created new album compilation: "${albumToSave.name}"`, 'add');
      setOperationSuccess(`Success: "${albumToSave.name}" album compiled!`);
    } else {
      updated = currentAlbums.map(al => al.id === albumToSave.id ? albumToSave : al);
      RaagaDatabase.addLog(`Updated album details: "${albumToSave.name}"`, 'edit');
      setOperationSuccess(`Success: "${albumToSave.name}" album details updated!`);
    }

    const currentSongs = RaagaDatabase.getSongs();
    const updatedSongs = currentSongs.map(song => {
      if (song.albumId === albumToSave.id) {
        return {
          ...song,
          albumName: albumToSave.name,
        };
      }
      return song;
    });
    RaagaDatabase.saveSongs(updatedSongs);

    RaagaDatabase.saveAlbums(updated);
    setEditingAlbum(null);
    setIsCreatingAlbum(false);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  const handleDeleteAlbum = (albumId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the album "${name}"? This action cannot be undone.`)) {
      return;
    }

    const currentAlbums = RaagaDatabase.getAlbums();
    const filteredAlbums = currentAlbums.filter(al => al.id !== albumId);
    RaagaDatabase.saveAlbums(filteredAlbums);

    const currentSongs = RaagaDatabase.getSongs();
    const updatedSongs = currentSongs.map(song => {
      if (song.albumId === albumId) {
        return {
          ...song,
          albumId: undefined,
          albumName: undefined,
        };
      }
      return song;
    });
    RaagaDatabase.saveSongs(updatedSongs);

    const currentCurated = RaagaDatabase.getCurated();
    const updatedCurated = currentCurated.map(sect => {
      if (sect.itemIds.some(item => item.id === albumId && item.type === 'album')) {
        return {
          ...sect,
          itemIds: sect.itemIds.filter(item => !(item.id === albumId && item.type === 'album'))
        };
      }
      return sect;
    });
    RaagaDatabase.saveCurated(updatedCurated);

    RaagaDatabase.addLog(`Deleted album: "${name}"`, 'edit');
    setOperationSuccess(`Album "${name}" deleted successfully.`);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  const handleArtistFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !editingArtist) return;
    if (type === 'image') setUploadingImage(true);
    else setUploadingBanner(true);
    const url = await uploadArtistFile(editingArtist.id, file, type);
    if (url) {
      setEditingArtist(prev => prev ? { ...prev, [type]: url } : prev);
    } else {
      alert('Upload failed. Check connection or use a URL instead.');
    }
    if (type === 'image') setUploadingImage(false);
    else setUploadingBanner(false);
    e.target.value = '';
  };

  // CRUD Actions: ARTISTS
  const handleSaveArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist) return;
    if (!editingArtist.name.trim()) {
      alert('Artist name is required!');
      return;
    }

    const currentArtists = RaagaDatabase.getArtists();
    let updated: Artist[];

    if (isCreatingArtist) {
      if (currentArtists.some(ar => ar.id === editingArtist.id)) {
        alert('An artist with this ID already exists!');
        return;
      }
      updated = [...currentArtists, editingArtist];
      RaagaDatabase.addLog(`Created new artist profile: "${editingArtist.name}"`, 'add');
      setOperationSuccess(`Success: "${editingArtist.name}" profile saved!`);
    } else {
      updated = currentArtists.map(ar => ar.id === editingArtist.id ? editingArtist : ar);
      RaagaDatabase.addLog(`Updated artist profile: "${editingArtist.name}"`, 'edit');
      setOperationSuccess(`Success: "${editingArtist.name}" profile details successfully updated!`);
    }

    const currentSongs = RaagaDatabase.getSongs();
    const updatedSongs = currentSongs.map(song => {
      const artIdx = song.artists.findIndex(a => a.id === editingArtist.id);
      if (artIdx !== -1) {
        const updatedArtists = [...song.artists];
        updatedArtists[artIdx] = { id: editingArtist.id, name: editingArtist.name };
        return {
          ...song,
          artists: updatedArtists,
        };
      }
      return song;
    });
    RaagaDatabase.saveSongs(updatedSongs);

    const currentAlbums = RaagaDatabase.getAlbums();
    const updatedAlbums = currentAlbums.map(album => {
      const artIdx = album.artists.findIndex(a => a.id === editingArtist.id);
      if (artIdx !== -1) {
        const updatedArtists = [...album.artists];
        updatedArtists[artIdx] = { id: editingArtist.id, name: editingArtist.name };
        return {
          ...album,
          artists: updatedArtists,
        };
      }
      return album;
    });
    RaagaDatabase.saveAlbums(updatedAlbums);

    RaagaDatabase.saveArtists(updated);
    setEditingArtist(null);
    setIsCreatingArtist(false);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  const handleDeleteArtist = (artistId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the artist profile of "${name}"? This action cannot be undone.`)) {
      return;
    }

    const currentArtists = RaagaDatabase.getArtists();
    const filteredArtists = currentArtists.filter(ar => ar.id !== artistId);
    RaagaDatabase.saveArtists(filteredArtists);

    const currentSongs = RaagaDatabase.getSongs();
    const updatedSongs = currentSongs.map(song => {
      if (song.artists.some(a => a.id === artistId)) {
        return {
          ...song,
          artists: song.artists.filter(a => a.id !== artistId)
        };
      }
      return song;
    });
    RaagaDatabase.saveSongs(updatedSongs);

    const currentAlbums = RaagaDatabase.getAlbums();
    const updatedAlbums = currentAlbums.map(al => {
      if (al.artists.some(a => a.id === artistId)) {
        return {
          ...al,
          artists: al.artists.filter(a => a.id !== artistId)
        };
      }
      return al;
    });
    RaagaDatabase.saveAlbums(updatedAlbums);

    const currentCurated = RaagaDatabase.getCurated();
    const updatedCurated = currentCurated.map(sect => {
      if (sect.itemIds.some(item => item.id === artistId && item.type === 'artist')) {
        return {
          ...sect,
          itemIds: sect.itemIds.filter(item => !(item.id === artistId && item.type === 'artist'))
        };
      }
      return sect;
    });
    RaagaDatabase.saveCurated(updatedCurated);

    RaagaDatabase.addLog(`Deleted artist profile of: "${name}"`, 'edit');
    setOperationSuccess(`Artist "${name}" profile deleted successfully.`);
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Action: iTunes Song search
  const handleSongSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songSearchTerm.trim()) return;
    setIsSongSearching(true);
    const results = await searchITunesSongs(songSearchTerm);
    setSongResults(results);
    setIsSongSearching(false);
  };

  // Action: iTunes Song import
  const handleImportSong = async (item: ITunesSongResult) => {
    setImportingSongId(item.trackId);
    // Simulate real database injection latency
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      importSongIntoDatabase(item);
      setOperationSuccess(`Track "${item.trackName}" successfully imported! Artist: ${item.artistName}`);
      reloadData();
      // Remove track from results so user knows it's processed
      setSongResults(prev => prev.filter(p => p.trackId !== item.trackId));
      setTimeout(() => setOperationSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setImportingSongId(null);
    }
  };

  // Action: iTunes Album search
  const handleAlbumSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumSearchTerm.trim()) return;
    setIsAlbumSearching(true);
    const results = await searchITunesAlbums(albumSearchTerm);
    setAlbumResults(results);
    setIsAlbumSearching(false);
  };

  // Action: iTunes Album import
  const handleImportAlbum = async (item: ITunesAlbumResult) => {
    setImportingAlbumId(item.collectionId);
    await new Promise(resolve => setTimeout(resolve, 1500)); // More latency for multiple track children lookup
    try {
      await importAlbumIntoDatabase(item);
      setOperationSuccess(`LP Album "${item.collectionName}" with track listings successfully imported!`);
      reloadData();
      setAlbumResults(prev => prev.filter(p => p.collectionId !== item.collectionId));
      setTimeout(() => setOperationSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setImportingAlbumId(null);
    }
  };

  // Action: TMDB Logo Query search
  const handleTmdbLogoSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setIsTmdbSearching(true);
    const results = await searchTMDBLogos(tmdbQuery, tmdbApiKey);
    setTmdbResults(results);
    setIsTmdbSearching(false);
  };

  // Action: Bind TMDB Logo to local Album
  const handleBindLogoToAlbum = (logoItem: TMDBLogoResult) => {
    if (!selectedAlbumIdForLogo) {
      alert('Please specify which Album item to bind this logo onto!');
      return;
    }
    const activeAlbums = RaagaDatabase.getAlbums();
    const updated = activeAlbums.map(album => {
      if (album.id === selectedAlbumIdForLogo) {
        return {
          ...album,
          // Bind the backdrop or logo url
          logoUrl: logoItem.logoUrl
        };
      }
      return album;
    });

    RaagaDatabase.saveAlbums(updated);
    RaagaDatabase.addLog(`Updated title logo graphics on albumId: ${selectedAlbumIdForLogo}`, 'edit');
    setOperationSuccess('TMDB stylized text logo successfully saved and mapped onto album!');
    reloadData();
    // Reset logo list
    setTmdbResults([]);
    setTmdbQuery('');
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Action: Add Section row to curator home layout
  const handleCreateCuratedSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowTitle.trim()) return;
    const currentList = RaagaDatabase.getCurated();
    const newId = newRowTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check duplication
    if (currentList.some(r => r.id === newId)) {
      alert('A curated row matching that identifier already exists!');
      return;
    }

    const newRow: CuratedSection = {
      id: newId,
      title: newRowTitle,
      description: 'Newly configured administrative curation row.',
      itemIds: []
    };

    const updated = [...currentList, newRow];
    RaagaDatabase.saveCurated(updated);
    RaagaDatabase.addLog(`Created home row section: "${newRowTitle}"`, 'add');
    setNewRowTitle('');
    setOperationSuccess('Curator home row section successfully created!');
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Action: Clear section row fully
  const handleDeleteCuratedSection = (sectionId: string) => {
    const list = RaagaDatabase.getCurated();
    const updated = list.filter(r => r.id !== sectionId);
    RaagaDatabase.saveCurated(updated);
    RaagaDatabase.addLog(`Deleted curated row identifier: ${sectionId}`, 'edit');
    setOperationSuccess('Curator row successfully removed from landing layout.');
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Action: Add specific ID to curator row list
  const handleAddItemToCurSection = (sectionId: string, itemId: string, itemType: 'song' | 'album' | 'artist') => {
    const list = RaagaDatabase.getCurated();
    const updated = list.map(sect => {
      if (sect.id === sectionId) {
        // Prevent duplicates in section items
        if (sect.itemIds.some(i => i.id === itemId && i.type === itemType)) {
          return sect;
        }
        return {
          ...sect,
          itemIds: [...sect.itemIds, { type: itemType, id: itemId }]
        };
      }
      return sect;
    });

    RaagaDatabase.saveCurated(updated);
    RaagaDatabase.addLog(`Added ${itemType} (${itemId}) to CurRow: ${sectionId}`, 'edit');
    setOperationSuccess('Content successfully bound to curated row!');
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Action: Remove specific item from curated row
  const handleRemoveItemFromCurRow = (sectionId: string, itemId: string) => {
    const list = RaagaDatabase.getCurated();
    const updated = list.map(sect => {
      if (sect.id === sectionId) {
        return {
          ...sect,
          itemIds: sect.itemIds.filter(i => i.id !== itemId)
        };
      }
      return sect;
    });

    RaagaDatabase.saveCurated(updated);
    setOperationSuccess('Item removed from curation row.');
    reloadData();
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  // Save streaming links directly for selected song/album
  const handleSaveStreamingLinks = (itemType: 'song' | 'album', itemId: string) => {
    if (itemType === 'song') {
      const currentSongs = RaagaDatabase.getSongs();
      const updated = currentSongs.map(s => {
        if (s.id === itemId) {
          return {
            ...s,
            streamingLinks: {
              spotify: spotifyUrl,
              appleMusic: appleMusicUrl,
              youtubeMusic: youtubeMusicUrl,
              youtube: youtubeUrl,
              jioSaavn: jioSaavnUrl,
              amazonMusic: amazonMusicUrl,
            }
          };
        }
        return s;
      });
      RaagaDatabase.saveSongs(updated);
      const targetSong = updated.find(s => s.id === itemId);
      RaagaDatabase.addLog(`Updated streaming links for song: "${targetSong?.name || itemId}"`, 'edit');
      setOperationSuccess(`Streaming links updated for song "${targetSong?.name || itemId}"!`);
    } else {
      const currentAlbums = RaagaDatabase.getAlbums();
      const updated = currentAlbums.map(al => {
        if (al.id === itemId) {
          return {
            ...al,
            streamingLinks: {
              spotify: spotifyUrl,
              appleMusic: appleMusicUrl,
              youtubeMusic: youtubeMusicUrl,
              youtube: youtubeUrl,
              jioSaavn: jioSaavnUrl,
              amazonMusic: amazonMusicUrl,
            }
          };
        }
        return al;
      });
      RaagaDatabase.saveAlbums(updated);
      const targetAlbum = updated.find(al => al.id === itemId);
      RaagaDatabase.addLog(`Updated streaming links for album compilation: "${targetAlbum?.name || itemId}"`, 'edit');
      setOperationSuccess(`Streaming links updated for album compilation "${targetAlbum?.name || itemId}"!`);
    }

    reloadData();
    setSelectedLinkItem(null);
    setSpotifyUrl('');
    setAppleMusicUrl('');
    setYoutubeMusicUrl('');
    setYoutubeUrl('');
    setJioSaavnUrl('');
    setAmazonMusicUrl('');
    setTimeout(() => setOperationSuccess(''), 4000);
  };

  const selectItemForLinks = (type: 'song' | 'album', item: Song | Album) => {
    setSelectedLinkItem({ type, id: item.id });
    setSpotifyUrl(item.streamingLinks?.spotify || '');
    setAppleMusicUrl(item.streamingLinks?.appleMusic || '');
    setYoutubeMusicUrl(item.streamingLinks?.youtubeMusic || '');
    setYoutubeUrl(item.streamingLinks?.youtube || '');
    setJioSaavnUrl(item.streamingLinks?.jioSaavn || '');
    setAmazonMusicUrl(item.streamingLinks?.amazonMusic || '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      
      {/* 1. Header Admin Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-8 h-8 text-[#1DB954]" /> System Control Deck
          </h1>
          <p className="text-sm text-white/50 font-normal">
            Query iTunes directories, bind customized movie/showcase title logos, organize Home grids.
          </p>
        </div>

        {/* Dynamic Success notifications */}
        {operationSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-2 animate-pulse self-start md:self-auto max-w-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{operationSuccess}</span>
          </div>
        )}
      </div>

      {/* 2. Admin Tabs selectors */}
      <div className="flex items-center gap-1 bg-[#121212] p-1 border border-white/5 rounded-2xl overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview Metrics', icon: Sliders },
          { id: 'songs', label: 'Manage Songs', icon: Music },
          { id: 'albums', label: 'Manage Albums', icon: Disc },
          { id: 'artists', label: 'Manage Artists', icon: Users },
          { id: 'streaming-links', label: 'Streaming Link Editor', icon: Link2 },
          { id: 'collections', label: 'Curator Grid Organizer', icon: Layers },
          { id: 'import-songs', label: 'iTunes Single Import', icon: Download },
          { id: 'import-albums', label: 'iTunes LP Album Import', icon: Download },
          { id: 'tmdb', label: 'TMDB Logos Connector', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setAdminTab(tab.id as any);
                // Reset edit states to avoid visual mismatch
                setEditingSong(null);
                setIsCreatingSong(false);
                setEditingAlbum(null);
                setIsCreatingAlbum(false);
                setEditingArtist(null);
                setIsCreatingArtist(false);
                setSelectedLinkItem(null);
                setSpotifyUrl('');
                setAppleMusicUrl('');
                setYoutubeMusicUrl('');
                setYoutubeUrl('');
                setJioSaavnUrl('');
                setAmazonMusicUrl('');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-display shrink-0 transition-all flex items-center gap-2 ${
                isActive ? 'bg-[#1DB954] text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW METRICS */}
      {adminTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics grid cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-1">
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider font-bold">TOTAL SONG METADATA</p>
              <p className="text-4xl font-display font-black text-white">{songs.length}</p>
              <p className="text-[10px] text-white/40 pt-1 font-mono">100% active checksum</p>
            </div>
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-1">
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider font-bold">TOTAL COMPILATIONS</p>
              <p className="text-4xl font-display font-black text-white">{albums.length}</p>
              <p className="text-[10px] text-[#1DB954] pt-1 font-mono">LPs and Single files</p>
            </div>
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-1">
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider font-bold">TOTAL CONDUCTORS PILES</p>
              <p className="text-4xl font-display font-black text-white">{artists.length}</p>
              <p className="text-[10px] text-white/40 pt-1 font-mono">Verified bios profiles</p>
            </div>
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-1">
              <p className="text-white/30 text-xs font-mono uppercase tracking-wider font-bold">CURATED LAYOUT ROWS</p>
              <p className="text-4xl font-display font-black text-white">{curated.length}</p>
              <p className="text-[10px] text-white/40 pt-1 font-mono">Managed active rows</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Center for index summaries */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-4">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">Recently Cataloged Items</h3>
                <div className="divide-y divide-white/5 text-xs sm:text-sm">
                  {[...songs].reverse().slice(0, 5).map(song => (
                    <div key={song.id} className="py-3 flex justify-between items-center text-white/80">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <Music className="w-3.5 h-3.5 text-[#1DB954]" />
                        {song.name}
                      </span>
                      <span className="text-white/40 font-mono text-xs">by {song.artists[0]?.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live edits logs feed */}
            <div className="p-6 bg-[#121212] border border-white/5 rounded-2.5xl space-y-4">
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">System Logs</h3>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="space-y-1 border-l-2 border-l-white/10 pl-3">
                    <p className="text-xs text-white/70 max-w-full font-normal">{log.message}</p>
                    <p className="text-[9px] text-white/20 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: SONGS CATALOG CRUD MANAGER */}
      {adminTab === 'songs' && (
        <div className="space-y-6 animate-fade-in">
          {editingSong ? (
            /* Editing / Creating Song Form Wrapper */
            <form onSubmit={handleSaveSong} className="bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                    {isCreatingSong ? 'Add New Custom Song' : `Edit Song: "${editingSong.name}"`}
                  </h3>
                  <p className="text-white/40 text-xs">Fill in metadata catalog details and streaming links.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSong(null);
                    setIsCreatingSong(false);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  title="Cancel Curation"
                >
                  <X className="w-4.5 h-4.5 text-white/80" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual / Information Block */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Song Title</label>
                    <input
                      type="text"
                      required
                      value={editingSong.name}
                      onChange={(e) => setEditingSong({ ...editingSong, name: e.target.value })}
                      placeholder="e.g. Song title"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Song ID</label>
                      <input
                        type="text"
                        required
                        disabled={!isCreatingSong}
                        value={editingSong.id}
                        onChange={(e) => setEditingSong({ ...editingSong, id: e.target.value })}
                        placeholder="e.g. song-title"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Track Duration</label>
                      <input
                        type="text"
                        required
                        value={editingSong.duration}
                        onChange={(e) => setEditingSong({ ...editingSong, duration: e.target.value })}
                        placeholder="e.g. 5:19, 3:45"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Track Artwork Cover Image URL</label>
                    <div className="text-left space-y-2">
                      <input
                        type="text"
                        required
                        value={editingSong.artwork}
                        onChange={(e) => setEditingSong({ ...editingSong, artwork: e.target.value })}
                        placeholder="URL towards artwork cover"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                      {editingSong.artwork && (
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                          <img src={editingSong.artwork} className="w-12 h-12 rounded-lg object-cover" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }} />
                          <span className="text-[10px] text-white/40">Real-time artwork preview</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Parent Album Collection</label>
                      <select
                        value={editingSong.albumId || ''}
                        onChange={(e) => {
                          const alId = e.target.value;
                          const matched = albums.find(al => al.id === alId);
                          setEditingSong({
                            ...editingSong,
                            albumId: alId || undefined,
                            albumName: matched ? matched.name : undefined,
                            artwork: matched ? matched.artwork : editingSong.artwork
                          });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-xs text-white/80 outline-none cursor-pointer focus:border-[#1DB954]"
                      >
                        <option value="">-- No Album (Single Track) --</option>
                        {albums.map((al) => (
                          <option key={al.id} value={al.id}>{al.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Track No.</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingSong.trackNumber}
                        onChange={(e) => setEditingSong({ ...editingSong, trackNumber: Number(e.target.value) || 1 })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Track Genre</label>
                      <input
                        type="text"
                        required
                        value={editingSong.genre}
                        onChange={(e) => setEditingSong({ ...editingSong, genre: e.target.value })}
                        placeholder="e.g. Soundtrack, Pop, Rock..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Track Language</label>
                      <input
                        type="text"
                        required
                        value={editingSong.language}
                        onChange={(e) => setEditingSong({ ...editingSong, language: e.target.value })}
                        placeholder="e.g. Tamil, Hindi, English..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Release Date</label>
                      <input
                        type="date"
                        required
                        value={editingSong.releaseDate}
                        onChange={(e) => {
                          const yr = e.target.value ? new Date(e.target.value).getFullYear() : editingSong.releaseYear;
                          setEditingSong({ ...editingSong, releaseDate: e.target.value, releaseYear: yr });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-[#1DB954]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Release Year</label>
                      <input
                        type="number"
                        required
                        value={editingSong.releaseYear}
                        onChange={(e) => setEditingSong({ ...editingSong, releaseYear: Number(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Explicit Content Filter</p>
                      <p className="text-[10px] text-white/40 font-normal">Apply advisory parent labeling tag.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingSong.explicit}
                      onChange={(e) => setEditingSong({ ...editingSong, explicit: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded focus:ring-green-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sub-lists & Streaming Links Block */}
                <div className="space-y-6">
                  {/* Select Artist mappings */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Bound Artist(s)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {artists.map(art => {
                        const isSelected = editingSong.artists.some(a => a.id === art.id);
                        return (
                          <label key={art.id} className="flex items-center gap-2 p-2 bg-[#181818] rounded-xl hover:bg-white/5 cursor-pointer border border-white/5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                let nextArtists = [...editingSong.artists];
                                if (isSelected) {
                                  nextArtists = nextArtists.filter(a => a.id !== art.id);
                                } else {
                                  nextArtists.push({ id: art.id, name: art.name });
                                }
                                setEditingSong({ ...editingSong, artists: nextArtists });
                              }}
                              className="rounded text-[#1DB954] focus:ring-[#1DB954]"
                            />
                            <img src={art.image} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-[11px] text-white/80 truncate font-medium">{art.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#181818] p-4.5 rounded-2.5xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Users className="w-4 h-4 text-[#1DB954]" />
                      <h4 className="font-display font-extrabold text-white text-sm">Roster & Production Credits</h4>
                    </div>

                    <div className="space-y-3.5">
                      {renderCreditEditor('singer', 'Singer / Vocalist', 'Sai Abhyankkar, Arivu, Arun Srinivasan')}
                      {renderCreditEditor('composer', 'Composer / Arranger', 'Composer name, Arranger name')}
                      {renderCreditEditor('lyricist', 'Lyricist / Writer', 'Writer name, Lyricist name')}
                      {renderCreditEditor('producer', 'Executive Producer', 'Producer name, Studio name')}
                      {renderCreditEditor('musicDirector', 'Director / Conductor', 'Music director name, Conductor name')}

                      <p className="text-[10px] text-white/30 leading-relaxed">
                        Separate multiple manual credits with commas, or search existing artists and assign them. Empty fields use the public fallback text on the song page.
                      </p>
                    </div>
                  </div>

                  {/* YouTube Embed ID */}
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">YouTube Video/Trailer Embed ID</label>
                    <input
                      type="text"
                      value={editingSong.youtubeVideoId || ''}
                      onChange={(e) => setEditingSong({ ...editingSong, youtubeVideoId: e.target.value })}
                      placeholder="e.g. xSqqV9VpY7s (video ID part only)"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  {/* Dynamic Stream Links Card */}
                  <div className="bg-[#181818] p-4.5 rounded-2.5xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Link2 className="w-4 h-4 text-[#1DB954]" />
                      <h4 className="font-display font-extrabold text-white text-sm">Update Streaming Links</h4>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-green-400">Spotify Link</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.spotify || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), spotify: e.target.value }
                          })}
                          placeholder="e.g. https://open.spotify.com/track/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#fa576c]">Apple Music Link</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.appleMusic || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), appleMusic: e.target.value }
                          })}
                          placeholder="https://music.apple.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#ff2a1a]">YouTube Music Link</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.youtubeMusic || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), youtubeMusic: e.target.value }
                          })}
                          placeholder="https://music.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-600">YouTube Video Embed / Trailer URL</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.youtube || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), youtube: e.target.value }
                          })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-teal-400">JioSaavn Link</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.jioSaavn || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), jioSaavn: e.target.value }
                          })}
                          placeholder="https://www.jiosaavn.com/song/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00a8e1]">Amazon Music Link</span>
                        <input
                          type="text"
                          value={editingSong.streamingLinks?.amazonMusic || ''}
                          onChange={(e) => setEditingSong({
                            ...editingSong,
                            streamingLinks: { ...(editingSong.streamingLinks ?? {}), amazonMusic: e.target.value }
                          })}
                          placeholder="https://music.amazon.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSong(null);
                    setIsCreatingSong(false);
                  }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 rounded-xl shadow"
                >
                  <Save className="w-4 h-4" /> Save Song Record
                </button>
              </div>
            </form>
          ) : (
            /* Search & List of Songs Catalog Dashboard */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={songSearchFilter}
                    onChange={(e) => setSongSearchFilter(e.target.value)}
                    placeholder="Filter catalog songs by name, artists, album or genre..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-white/5 outline-none text-white text-xs sm:text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingSong(getBlankSong());
                    setIsCreatingSong(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Custom Song
                </button>
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-2.5xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40 font-mono uppercase tracking-widest text-[10px]">
                        <th className="p-4">Song Detail / Art</th>
                        <th className="p-4">Album Connection</th>
                        <th className="p-4">Conductors / Artists</th>
                        <th className="p-4">Streaming Active</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {songs
                        .filter(s => {
                          const query = songSearchFilter.toLowerCase();
                          return s.name.toLowerCase().includes(query) ||
                            (s.albumName && s.albumName.toLowerCase().includes(query)) ||
                            s.genre.toLowerCase().includes(query) ||
                            s.artists.some(a => a.name.toLowerCase().includes(query));
                        })
                        .map(song => (
                          <tr key={song.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={song.artwork} className="w-10 h-10 rounded-lg object-cover" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }} />
                                <div className="text-left">
                                  <p className="font-bold text-white flex items-center gap-1">
                                    {song.name}
                                    {song.explicit && <span className="px-1 bg-white/10 text-white/60 text-[9px] rounded font-mono font-black">E</span>}
                                  </p>
                                  <p className="text-[10px] text-white/30 font-mono pt-0.5">{song.duration} • {song.genre} • {song.language}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-left text-white/80 font-medium">
                              {song.albumName ? song.albumName : <span className="text-white/25 italic">Independent Single</span>}
                            </td>
                            <td className="p-4 text-left">
                              <p className="text-xs text-white/70 max-w-[150px] truncate">
                                {song.artists.map(a => a.name).join(', ')}
                              </p>
                            </td>
                            <td className="p-4">
                              {/* Badges of dynamic streams */}
                              <div className="flex gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${song.streamingLinks?.spotify ? 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20' : 'bg-white/5 text-white/20'}`}>SP</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${song.streamingLinks?.appleMusic ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-white/20'}`}>AM</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${song.streamingLinks?.youtubeMusic ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/20'}`}>YT</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${song.streamingLinks?.jioSaavn ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-white/5 text-white/20'}`}>JS</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${song.streamingLinks?.amazonMusic ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-white/5 text-white/20'}`}>AZ</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => setEditingSong(song)}
                                  className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                  title="Edit Song"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSong(song.id, song.name)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-all"
                                  title="Delete Song"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: ALBUMS CATALOG CRUD MANAGER */}
      {adminTab === 'albums' && (
        <div className="space-y-6 animate-fade-in">
          {editingAlbum ? (
            /* Editing / Creating Album Form */
            <form onSubmit={handleSaveAlbum} className="bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                    {isCreatingAlbum ? 'Add Custom Album LP Record' : `Edit Album details: "${editingAlbum.name}"`}
                  </h3>
                  <p className="text-white/40 text-xs">Configure compilation details, artwork cover, list and dynamic streams.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlbum(null);
                    setIsCreatingAlbum(false);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  title="Cancel Curation"
                >
                  <X className="w-4.5 h-4.5 text-white/80" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Album Name</label>
                    <input
                      type="text"
                      required
                      value={editingAlbum.name}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Album ID</label>
                      <input
                        type="text"
                        required
                        disabled={!isCreatingAlbum}
                        value={editingAlbum.id}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, id: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Type Class</label>
                      <select
                        value={editingAlbum.type}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, type: e.target.value as any })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-xs text-white outline-none cursor-pointer focus:border-[#1DB954]"
                      >
                        <option value="album">Full Album LP</option>
                        <option value="single">Single Record</option>
                        <option value="ep">EP Extended Play</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Album Artwork Image URL</label>
                    <input
                      type="text"
                      required
                      value={editingAlbum.artwork}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, artwork: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Stylized Movie Banner / TMDB Logo URL (Optional)</label>
                    <input
                      type="text"
                      value={editingAlbum.logoUrl || ''}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, logoUrl: e.target.value })}
                      placeholder="e.g. https://image.tmdb.org/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Genres</label>
                      <input
                        type="text"
                        required
                        value={editingAlbum.genre}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, genre: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Languages</label>
                      <input
                        type="text"
                        required
                        value={editingAlbum.language}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, language: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Release Date</label>
                      <input
                        type="date"
                        required
                        value={editingAlbum.releaseDate}
                        onChange={(e) => {
                          const yr = e.target.value ? new Date(e.target.value).getFullYear() : editingAlbum.releaseYear;
                          setEditingAlbum({ ...editingAlbum, releaseDate: e.target.value, releaseYear: yr });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-[#1DB954]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Release Year</label>
                      <input
                        type="number"
                        required
                        value={editingAlbum.releaseYear}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum, releaseYear: Number(e.target.value) || new Date().getFullYear() })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Total Compilation Runtime Duration</label>
                    <input
                      type="text"
                      required
                      value={editingAlbum.runtime}
                      onChange={(e) => setEditingAlbum({ ...editingAlbum, runtime: e.target.value })}
                      placeholder="e.g. 51 mins, 120 mins..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Bind Artist checks */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Mapped Album Artist(s)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                      {artists.map(art => {
                        const isSelected = editingAlbum.artists.some(a => a.id === art.id);
                        return (
                          <label key={art.id} className="flex items-center gap-2 p-2 bg-[#181818] rounded-xl hover:bg-white/5 cursor-pointer border border-white/5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                let nextArtists = [...editingAlbum.artists];
                                if (isSelected) {
                                  nextArtists = nextArtists.filter(a => a.id !== art.id);
                                } else {
                                  nextArtists.push({ id: art.id, name: art.name });
                                }
                                setEditingAlbum({ ...editingAlbum, artists: nextArtists });
                              }}
                              className="rounded text-[#1DB954] focus:ring-[#1DB954]"
                            />
                            <img src={art.image} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-[11px] text-white/80 truncate font-medium">{art.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Album streaming links */}
                  <div className="bg-[#181818] p-4.5 rounded-2.5xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Link2 className="w-4 h-4 text-[#1DB954]" />
                      <h4 className="font-display font-extrabold text-white text-sm">Update Album Streaming Links</h4>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#1DB954]">Spotify Playlist Link</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.spotify || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), spotify: e.target.value }
                          })}
                          placeholder="https://open.spotify.com/album/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#fa576c]">Apple Music Album Link</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.appleMusic || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), appleMusic: e.target.value }
                          })}
                          placeholder="https://music.apple.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#ff2a1a]">YouTube Music Album Link</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.youtubeMusic || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), youtubeMusic: e.target.value }
                          })}
                          placeholder="https://music.youtube.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-600">YouTube Video Embed / Trailer URL</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.youtube || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), youtube: e.target.value }
                          })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-teal-400">JioSaavn Link</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.jioSaavn || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), jioSaavn: e.target.value }
                          })}
                          placeholder="https://www.jiosaavn.com/album/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00a8e1]">Amazon Music Link</span>
                        <input
                          type="text"
                          value={editingAlbum.streamingLinks?.amazonMusic || ''}
                          onChange={(e) => setEditingAlbum({
                            ...editingAlbum,
                            streamingLinks: { ...(editingAlbum.streamingLinks ?? {}), amazonMusic: e.target.value }
                          })}
                          placeholder="https://music.amazon.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-[#121212] border border-white/5 outline-none text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAlbum(null);
                    setIsCreatingAlbum(false);
                  }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 rounded-xl shadow"
                >
                  <Save className="w-4 h-4" /> Save Album LP
                </button>
              </div>
            </form>
          ) : (
            /* List of Albums */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={albumSearchFilter}
                    onChange={(e) => setAlbumSearchFilter(e.target.value)}
                    placeholder="Filter album list by compilation name, genre, language..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-white/5 outline-none text-white text-xs sm:text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingAlbum(getBlankAlbum());
                    setIsCreatingAlbum(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Album LP
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums
                  .filter(al => {
                    const query = albumSearchFilter.toLowerCase();
                    return al.name.toLowerCase().includes(query) ||
                      al.genre.toLowerCase().includes(query) ||
                      al.artists.some(a => a.name.toLowerCase().includes(query));
                  })
                  .map(album => (
                    <div key={album.id} className="p-5 bg-[#121212] border border-white/5 hover:border-white/10 rounded-2.5xl space-y-4 flex flex-col justify-between transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          <img src={album.artwork} className="w-14 h-14 rounded-xl object-cover shadow-lg mb-1" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }} />
                          <div className="text-left truncate">
                            <h4 className="font-display font-black text-white text-sm sm:text-base truncate">{album.name}</h4>
                            <p className="text-xs text-white/40 truncate">by {album.artists.map(a => a.name).join(', ')}</p>
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-1.5 text-left bg-white/3 p-3 rounded-xl border border-white/5 text-[11px] sm:text-xs">
                          <p className="text-white/60"><span className="text-white/30 font-mono">Format Type:</span> <span className="font-semibold uppercase text-green-400">{album.type}</span></p>
                          <p className="text-white/60"><span className="text-white/30 font-mono">Total Tracks:</span> <span className="font-semibold text-white">{album.trackIds.length} tracks</span></p>
                          <p className="text-white/60"><span className="text-white/30 font-mono">Runtime:</span> <span className="font-semibold text-white">{album.runtime}</span></p>
                          <p className="text-white/60"><span className="text-white/30 font-mono">Released:</span> <span className="font-semibold text-white">{album.releaseDate} ({album.releaseYear})</span></p>
                        </div>

                        {/* Stream networks mapped status */}
                        <div className="flex gap-1.5 justify-start pt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${album.streamingLinks?.spotify ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'bg-white/5 text-white/10'}`}>Spotify</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${album.streamingLinks?.appleMusic ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-white/10'}`}>Apple</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${album.streamingLinks?.youtubeMusic ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/10'}`}>YouTube</span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ID: {album.id}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingAlbum(album)}
                            className="p-2 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlbum(album.id, album.name)}
                            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: ARTISTS CATALOG CRUD MANAGER */}
      {adminTab === 'artists' && (
        <div className="space-y-6 animate-fade-in">
          {editingArtist ? (
            /* Editing / Creating Artist Form */
            <form onSubmit={handleSaveArtist} className="bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                    {isCreatingArtist ? 'Generate Artist Profile card' : `Edit Artist Bio: "${editingArtist.name}"`}
                  </h3>
                  <p className="text-white/40 text-xs">Publish biography context, promotional roles, and layout imagery.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingArtist(null);
                    setIsCreatingArtist(false);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  title="Cancel Curation"
                >
                  <X className="w-4.5 h-4.5 text-white/80" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Conductor Name</label>
                    <input
                      type="text"
                      required
                      value={editingArtist.name}
                      onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                      placeholder="e.g. Artist name"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Unique Artist ID</label>
                    <input
                      type="text"
                      required
                      disabled={!isCreatingArtist}
                      value={editingArtist.id}
                      onChange={(e) => setEditingArtist({ ...editingArtist, id: e.target.value })}
                      placeholder="e.g. artist-name"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Primary Curation Role</label>
                    <input
                      type="text"
                      required
                      value={editingArtist.primaryRole}
                      onChange={(e) => setEditingArtist({ ...editingArtist, primaryRole: e.target.value })}
                      placeholder="e.g. Composer, Singer, Band"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Multiple Tags Roles (Comma Separated)</label>
                    <input
                      type="text"
                      required
                      value={editingArtist.roles.join(', ')}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                        setEditingArtist({ ...editingArtist, roles: vals });
                      }}
                      placeholder="e.g. Composer, Singer, Lyricist, Producer"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Profile Image</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingArtist.image}
                          onChange={(e) => setEditingArtist({ ...editingArtist, image: e.target.value })}
                          placeholder="Image URL"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                        />
                        <label className={`px-3 py-2.5 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/20 text-[#1DB954] cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload className="w-4 h-4" />
                          {uploadingImage ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleArtistFileUpload(e, 'image')}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      {editingArtist.image && (
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                          <img src={editingArtist.image} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }} />
                          <span className="text-[10px] text-white/40">Preview</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Landscape Banner Image (Optional)</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingArtist.banner || ''}
                          onChange={(e) => setEditingArtist({ ...editingArtist, banner: e.target.value })}
                          placeholder="Background image URL"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-sm outline-none focus:border-[#1DB954]"
                        />
                        <label className={`px-3 py-2.5 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/20 text-[#1DB954] cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 text-xs font-bold ${uploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload className="w-4 h-4" />
                          {uploadingBanner ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleArtistFileUpload(e, 'banner')}
                            className="hidden"
                            disabled={uploadingBanner}
                          />
                        </label>
                      </div>
                      {editingArtist.banner && (
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                          <div className="w-24 h-10 rounded-lg bg-cover bg-center border border-white/5" style={{ backgroundImage: `url(${editingArtist.banner})` }} />
                          <span className="text-[10px] text-white/40">Preview</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">Artist biography (Formatted paragraph)</label>
                    <textarea
                      required
                      rows={5}
                      value={editingArtist.bio}
                      onChange={(e) => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                      placeholder="Enter detailed description context regarding active works, Oscars or accolades..."
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/5 text-white text-xs sm:text-sm outline-none focus:border-[#1DB954] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingArtist(null);
                    setIsCreatingArtist(false);
                  }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 rounded-xl shadow"
                >
                  <Save className="w-4 h-4" /> Save Artist Profile
                </button>
              </div>
            </form>
          ) : (
            /* List of Artists registered */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={artistSearchFilter}
                    onChange={(e) => setArtistSearchFilter(e.target.value)}
                    placeholder="Search artist profiles by name, role tag..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-white/5 outline-none text-white text-xs sm:text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingArtist(getBlankArtist());
                    setIsCreatingArtist(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Artist Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artists
                  .filter(art => {
                    const query = artistSearchFilter.toLowerCase();
                    return art.name.toLowerCase().includes(query) ||
                      art.primaryRole.toLowerCase().includes(query);
                  })
                  .map(artist => (
                    <div key={artist.id} className="p-4 bg-[#121212] border border-white/5 hover:border-white/10 rounded-2.5xl flex gap-4 transition-colors text-left relative">
                      <img src={artist.image} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg border border-white/5" onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }} />
                      <div className="flex-1 min-w-0 pr-12 space-y-1.5">
                        <div className="space-y-0.5">
                          <p className="font-display font-black text-white text-base sm:text-lg tracking-tight truncate">{artist.name}</p>
                          <p className="text-[10px] text-[#1DB954] font-mono font-bold tracking-widest uppercase">{artist.primaryRole}</p>
                        </div>
                        <p className="text-white/45 text-xs line-clamp-2 leading-relaxed">{artist.bio || 'Biography profile details not compiled yet.'}</p>
                        <div className="flex flex-wrap gap-1 font-mono text-[9px] text-white/30">
                          {artist.roles.map(r => <span key={r} className="px-1.5 py-0.5 bg-white/4 rounded border border-white/5">{r}</span>)}
                        </div>
                      </div>

                      {/* Action Triggers in corners */}
                      <div className="absolute right-4 top-4 flex gap-1">
                        <button
                          onClick={() => setEditingArtist(artist)}
                          className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArtist(artist.id, artist.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white/15">
                        ID: {artist.id}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ITUNES SINGLE SONG IMPORTER */}
      {adminTab === 'import-songs' && (
        <div className="space-y-6 animate-fade-in bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl shadow">
          <div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">iTunes Directory Single Track Lookup</h3>
            <p className="text-white/40 text-xs sm:text-sm">Enter lookups of individual tracks. Imports relations cleanly without duplications.</p>
          </div>

          <form onSubmit={handleSongSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DB954]" />
              <input 
                type="text"
                placeholder="Search songs by title or artist..."
                value={songSearchTerm}
                onChange={(e) => setSongSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 focus:border-[#1DB954]/50 outline-none text-white text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSongSearching}
              className="px-6 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isSongSearching ? 'Quering Directory...' : 'Search Engine'}
            </button>
          </form>

          {/* Results lookup list */}
          {songResults.length > 0 && (
            <div className="space-y-3.5 pt-4">
              <h4 className="font-mono text-[10px] font-bold text-white/45 uppercase tracking-wider">Matches Resolved ({songResults.length})</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songResults.map((item) => {
                  const isImporting = importingSongId === item.trackId;
                  return (
                    <div 
                      key={item.trackId}
                      className="p-3.5 bg-[#181818] rounded-2xl border border-white/5 flex items-center justify-between gap-4 group/item hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        <img 
                          src={item.artworkUrl100} 
                          alt={item.trackName} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="truncate text-xs sm:text-sm text-left">
                          <p className="font-bold text-white truncate">{item.trackName}</p>
                          <p className="text-white/40 truncate">by {item.artistName} • {item.collectionName}</p>
                          <p className="text-[10px] text-[#1DB954] font-mono mt-0.5 uppercase font-bold tracking-wider">{item.primaryGenreName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportSong(item)}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#1DB954] text-white hover:text-black font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        {isImporting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                            Archiving...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Import
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ITUNES ALBUM LP IMPORTER */}
      {adminTab === 'import-albums' && (
        <div className="space-y-6 animate-fade-in bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl shadow">
          <div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">iTunes Directory LP Album Search</h3>
            <p className="text-white/40 text-xs sm:text-sm">Looks up full Album records and automatically queries, downloads, and maps child songs inside the album track listing!</p>
          </div>

          <form onSubmit={handleAlbumSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DB954]" />
              <input 
                type="text"
                placeholder="Search albums by title or artist..."
                value={albumSearchTerm}
                onChange={(e) => setAlbumSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 focus:border-[#1DB954]/50 outline-none text-white text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={isAlbumSearching}
              className="px-6 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isAlbumSearching ? 'Querying...' : 'Search Albums'}
            </button>
          </form>

          {/* Results lists */}
          {albumResults.length > 0 && (
            <div className="space-y-3.5 pt-4">
              <h4 className="font-mono text-[10px] font-bold text-white/45 uppercase tracking-wider">Albums Matches Resolved ({albumResults.length})</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albumResults.map((item) => {
                  const isImporting = importingAlbumId === item.collectionId;
                  return (
                    <div 
                      key={item.collectionId}
                      className="p-3.5 bg-[#181818] rounded-2xl border border-white/5 flex items-center justify-between gap-4 group/item hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 truncate">
                        <img 
                          src={item.artworkUrl100} 
                          alt={item.collectionName} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="truncate text-xs sm:text-sm text-left">
                          <p className="font-bold text-white truncate">{item.collectionName}</p>
                          <p className="text-white/40 truncate">by {item.artistName} • {item.trackCount} tracks</p>
                          <p className="text-[10px] text-[#1DB954] font-mono mt-0.5 uppercase font-bold tracking-wider">{item.primaryGenreName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImportAlbum(item)}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#1DB954] text-white hover:text-black font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        {isImporting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                            Importing LP...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Full Import
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TMDB TITLE LOGOS CONNECTOR */}
      {adminTab === 'tmdb' && (
        <div className="space-y-6 animate-fade-in bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl shadow">
          <div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white flex items-center gap-1">
              <Sparkles className="w-6 h-6 text-[#1DB954] fill-current" /> TMDB album Logo Importer
            </h3>
            <p className="text-white/40 text-xs sm:text-sm">Bind cinematic horizontal title logos to your showcase albums. Updates billboards and headers automatically.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Form settings */}
            <div className="space-y-4 lg:col-span-1 border-r border-white/5 pr-0 lg:pr-6">
              
              {/* Select target Album */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">
                  Select Target Album
                </label>
                <select 
                  value={selectedAlbumIdForLogo}
                  onChange={(e) => {
                    setSelectedAlbumIdForLogo(e.target.value);
                    // Autofill TMDB search query with album name to save admin effort
                    const albumRef = albums.find(al => al.id === e.target.value);
                    if (albumRef) {
                      setTmdbQuery(albumRef.name.replace('(Original Soundtrack)', '').replace('(Original Motion Picture Soundtrack)', '').trim());
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white/80 outline-none text-xs sm:text-sm cursor-pointer focus:border-[#1DB954]"
                >
                  <option value="">-- Choose Album from Catalog --</option>
                  {albums.map((al) => (
                    <option key={al.id} value={al.id}>{al.name}</option>
                  ))}
                </select>
              </div>

              {/* TMDB API key (required for real results) */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">
                  TMDB API Key <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="password"
                  placeholder="e.g. your_tmdb_api_key"
                  value={tmdbApiKey}
                  onChange={(e) => setTmdbApiKey(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 outline-none text-white text-xs placeholder-white/20"
                />
                <p className="text-[10px] text-white/25 mt-1.5">Get a free key at <span className="text-[#1DB954]">themoviedb.org/settings/api</span></p>
              </div>

              {/* TMDB Search string */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest font-mono mb-2">
                  TMDB Movie/LP Query Term
                </label>
                <input 
                  type="text"
                  placeholder="Search a movie or album title..."
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-white/5 outline-none text-white text-xs placeholder-white/20"
                />
              </div>

              <button
                onClick={handleTmdbLogoSearch}
                disabled={isTmdbSearching || !tmdbQuery.trim() || !tmdbApiKey.trim()}
                className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs active:scale-[0.98] disabled:opacity-50"
              >
                {isTmdbSearching ? 'Querying TMDB Directory...' : 'Search TMDB Logos'}
              </button>
            </div>

            {/* Results Grid display list */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-mono text-[10px] font-bold text-white/40 uppercase tracking-wider">TMDB Logo Cards Matchings</h4>
              
              {!tmdbApiKey.trim() ? (
                <div className="py-12 border border-dashed border-white/5 rounded-2.5xl text-center text-white/20 text-xs font-mono">
                  Enter a TMDB API key above to search for movie title logos.
                </div>
              ) : tmdbResults.length === 0 ? (
                <div className="py-12 border border-dashed border-white/5 rounded-2.5xl text-center text-white/20 text-xs font-mono">
                  No results found. Try a different search term.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {tmdbResults.map((movie) => {
                    const allLogos = movie.logos?.length ? movie.logos : (movie.logoUrl ? [movie.logoUrl] : []);
                    return (
                      <div
                        key={movie.id}
                        className="p-4 bg-[#181818] rounded-2xl border border-white/5 space-y-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {movie.poster_path && (
                            <img src={movie.poster_path} alt={movie.title} className="w-10 h-14 rounded-lg object-cover border border-white/5" />
                          )}
                          <div>
                            <p className="font-bold text-sm text-white">{movie.title}</p>
                            <p className="text-[10px] text-white/40 font-mono">{movie.logos?.length ? `${movie.logos.length} title logo${movie.logos.length !== 1 ? 's' : ''} available` : 'Backdrop available (no title logo)'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {allLogos.map((url, idx) => (
                            <div key={idx} className="space-y-2 bg-black/30 rounded-xl p-2 border border-white/5">
                              <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#0a0a0a] relative flex items-center justify-center">
                                <img
                                  src={url}
                                  alt={`${movie.title} logo ${idx + 1}`}
                                  className="max-w-full max-h-full object-contain p-2"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                              <button
                                onClick={() => handleBindLogoToAlbum({ ...movie, logoUrl: url })}
                                disabled={!selectedAlbumIdForLogo}
                                className="w-full py-2 bg-white/5 hover:bg-[#1DB954] text-white hover:text-black disabled:text-white/20 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                              >
                                Bind Logo To Album
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 5: CURATOR HOME LAYOUT ORGANIZER */}
      {adminTab === 'collections' && (
        <div className="space-y-8 animate-fade-in bg-[#121212] p-5 sm:p-8 border border-white/5 rounded-2.5xl shadow">
          <div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">Curator Horizontal Grid Dashboard Sections</h3>
            <p className="text-white/40 text-xs sm:text-sm">Rearrange rows groupings, manage dynamic sliders order, map individual ID entities.</p>
          </div>

          {/* Create Row form */}
          <form onSubmit={handleCreateCuratedSection} className="flex gap-3 border-b border-white/5 pb-6">
            <div className="relative flex-1">
              <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text"
                placeholder="Curate New Horizontal Row, e.g. Malayalam Essentials, Hidden Gems..."
                value={newRowTitle}
                onChange={(e) => setNewRowTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 focus:border-[#1DB954]/50 outline-none text-white text-sm"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm active:scale-[0.98]"
            >
              Add Curator Row
            </button>
          </form>

          {/* Current Curated Section Cards */}
          <div className="space-y-6">
            {curated.map((section) => (
              <div 
                key={section.id} 
                className="p-5 rounded-2xl bg-[#181818] border border-white/5 space-y-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h4 className="font-display font-black text-white text-base sm:text-lg">{section.title}</h4>
                    <p className="text-[10px] text-white/40 font-mono tracking-wider">identifier: {section.id}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCuratedSection(section.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Delete Curated Row fully"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid items in this curated slider section */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Row Slider Elements ({section.itemIds.length})</p>
                  
                  {section.itemIds.length === 0 ? (
                    <p className="text-xs text-white/30 font-mono italic">Curator row empty. Add search files mapping below.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {section.itemIds.map((ref) => {
                        // Resolve local names cleanly
                        let labelText = `${ref.type}: ${ref.id}`;
                        if (ref.type === 'song') {
                          const matched = songs.find(s => s.id === ref.id);
                          if (matched) labelText = `Track: ${matched.name}`;
                        } else if (ref.type === 'album') {
                          const matched = albums.find(al => al.id === ref.id);
                          if (matched) labelText = `LP: ${matched.name}`;
                        } else if (ref.type === 'artist') {
                          const matched = artists.find(art => art.id === ref.id);
                          if (matched) labelText = `Artist: ${matched.name}`;
                        }

                        return (
                          <div 
                            key={`${ref.type}-${ref.id}`}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-white flex items-center gap-2"
                          >
                            <span>{labelText}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveItemFromCurRow(section.id, ref.id)}
                              className="text-white/40 hover:text-rose-400 text-[10px] font-bold"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Add element tool */}
                <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-[10px] font-mono text-white/40 shrink-0 uppercase tracking-widest">Quickbind entity item:</span>
                  <select
                    className="px-3 py-1.5 rounded-lg bg-[#121212] border border-white/5 outline-none text-white text-xs cursor-pointer focus:border-[#1DB954]"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const parts = val.split(':');
                      handleAddItemToCurSection(section.id, parts[1], parts[0] as any);
                      e.target.value = ''; // Reset select tag
                    }}
                  >
                    <option value="">-- Select entity item to bind --</option>
                    <optgroup label="Index Songs">
                      {songs.map(s => <option key={s.id} value={`song:${s.id}`}>Track: {s.name}</option>)}
                    </optgroup>
                    <optgroup label="Index Albums">
                      {albums.map(al => <option key={al.id} value={`album:${al.id}`}>LP: {al.name}</option>)}
                    </optgroup>
                    <optgroup label="Index Artists">
                      {artists.map(art => <option key={art.id} value={`artist:${art.id}`}>Artist: {art.name}</option>)}
                    </optgroup>
                  </select>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUBTAB: STREAMING LINKS EDITOR MODULE */}
      {adminTab === 'streaming-links' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="border border-white/5 bg-[#121212] p-5 sm:p-6 rounded-2.5xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1DB954]/10 text-[#1DB954]">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">Universal Streaming Link Gateway</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  Quickly manage catalog link connections. Select any record (Song or Album) to update streaming links for major networks including Spotify, Apple Music, YouTube Music, YouTube Video Embed, JioSaavn, and Amazon Music.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SECTION: LISTINGS / SELECTOR (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Search + Type Filtering bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={linkSearchQuery}
                    onChange={(e) => setLinkSearchQuery(e.target.value)}
                    placeholder="Search master catalog indexes..."
                    className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-white/5 outline-none text-white text-xs sm:text-sm rounded-xl focus:border-[#1DB954]"
                  />
                </div>
                
                {/* Type toggle selection */}
                <div className="flex bg-[#121212] p-1 border border-white/5 rounded-xl shrink-0">
                  {(['all', 'songs', 'albums'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLinkTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-all ${
                        linkTypeFilter === type 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable list content */}
              <div className="bg-[#121212] border border-white/5 rounded-2.5xl overflow-hidden max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {/* Combine Songs and Albums for filtering */}
                  {[
                    ...(linkTypeFilter === 'all' || linkTypeFilter === 'songs' 
                      ? songs.map(s => ({ ...s, itemType: 'song' as const })) 
                      : []),
                    ...(linkTypeFilter === 'all' || linkTypeFilter === 'albums' 
                      ? albums.map(al => ({ ...al, itemType: 'album' as const })) 
                      : [])
                  ]
                    .filter(item => {
                      const query = linkSearchQuery.toLowerCase();
                      const matchesName = item.name.toLowerCase().includes(query);
                      const matchesArtist = item.artists.some(art => art.name.toLowerCase().includes(query));
                      return matchesName || matchesArtist;
                    })
                    .map((item) => {
                      const isSelected = selectedLinkItem?.type === item.itemType && selectedLinkItem?.id === item.id;
                      const hasSpotify = !!item.streamingLinks?.spotify;
                      const hasApple = !!item.streamingLinks?.appleMusic;
                      const hasYoutube = !!item.streamingLinks?.youtubeMusic;
                      const hasYoutubeVideo = !!item.streamingLinks?.youtube;
                      const hasJioSaavn = !!item.streamingLinks?.jioSaavn;
                      const hasAmazon = !!item.streamingLinks?.amazonMusic;
                      
                      const activeLinksCount = [hasSpotify, hasApple, hasYoutube, hasYoutubeVideo, hasJioSaavn, hasAmazon].filter(Boolean).length;

                      return (
                        <div
                          key={`${item.itemType}-${item.id}`}
                          onClick={() => selectItemForLinks(item.itemType, item as any)}
                          className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-white/5 border-l-4 border-[#1DB954]' 
                              : 'hover:bg-white/2 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={item.artwork} 
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0" 
                              onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }}
                            />
                            <div className="text-left min-w-0">
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase mb-1 bg-white/5 text-white/50">
                                {item.itemType === 'song' ? 'Song Track' : 'Album LP'}
                              </span>
                              <h4 className="font-display font-bold text-white text-xs sm:text-sm truncate leading-tight mt-0.5">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-white/40 truncate mt-0.5 font-normal">
                                {item.artists.map(a => a.name).join(', ')}
                              </p>
                            </div>
                          </div>

                          {/* Badge tracker metrics */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-mono font-bold text-white/30">
                              {activeLinksCount}/6 Configured
                            </span>
                            <div className="flex gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${hasSpotify ? 'bg-[#1DB954]' : 'bg-white/10'}`} title="Spotify" />
                              <span className={`w-1.5 h-1.5 rounded-full ${hasApple ? 'bg-rose-500' : 'bg-white/10'}`} title="Apple Music" />
                              <span className={`w-1.5 h-1.5 rounded-full ${hasYoutube ? 'bg-red-500' : 'bg-white/10'}`} title="YouTube Music" />
                              <span className={`w-1.5 h-1.5 rounded-full ${hasYoutubeVideo ? 'bg-red-600' : 'bg-white/10'}`} title="YouTube Video Embed" />
                              <span className={`w-1.5 h-1.5 rounded-full ${hasJioSaavn ? 'bg-indigo-500' : 'bg-white/10'}`} title="JioSaavn" />
                              <span className={`w-1.5 h-1.5 rounded-full ${hasAmazon ? 'bg-sky-400' : 'bg-white/10'}`} title="Amazon Music" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* RIGHT SECTION: FORM DETAILS/EDITOR (5 Cols) */}
            <div className="lg:col-span-5">
              {selectedLinkItem ? (
                (() => {
                  const activeItem = selectedLinkItem.type === 'song' 
                    ? songs.find(s => s.id === selectedLinkItem.id)
                    : albums.find(al => al.id === selectedLinkItem.id);
                  
                  if (!activeItem) return null;

                  return (
                    <div className="bg-[#121212] p-5 sm:p-6 border border-white/5 rounded-2.5xl space-y-6 animate-fade-in text-left">
                      
                      {/* Active profile teaser header */}
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4.5">
                        <img 
                          src={activeItem.artwork} 
                          className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10" 
                          onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'; }}
                        />
                        <div className="min-w-0">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold font-mono tracking-widest uppercase">
                            Editing Links
                          </span>
                          <h4 className="font-display font-extrabold text-white text-base truncate mt-1 leading-tight">{activeItem.name}</h4>
                          <p className="text-white/40 text-xs truncate mt-0.5">{activeItem.artists.map(a => a.name).join(', ')}</p>
                        </div>
                      </div>

                      {/* Editing fields container */}
                      <div className="space-y-4">
                        
                        {/* Spotify link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-[#1DB954]" /> Spotify URL
                          </label>
                          <input
                            type="text"
                            value={spotifyUrl}
                            onChange={(e) => setSpotifyUrl(e.target.value)}
                            placeholder="https://open.spotify.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-[#1DB954]"
                          />
                        </div>

                        {/* Apple Music link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> Apple Music URL
                          </label>
                          <input
                            type="text"
                            value={appleMusicUrl}
                            onChange={(e) => setAppleMusicUrl(e.target.value)}
                            placeholder="https://music.apple.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-rose-500"
                          />
                        </div>

                        {/* YouTube Music link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> YouTube Music URL
                          </label>
                          <input
                            type="text"
                            value={youtubeMusicUrl}
                            onChange={(e) => setYoutubeMusicUrl(e.target.value)}
                            placeholder="https://music.youtube.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-red-500"
                          />
                        </div>

                        {/* YouTube Video Embed link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-red-600" /> YouTube Video Embed / Trailer URL
                          </label>
                          <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-red-600"
                          />
                        </div>

                        {/* JioSaavn link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" /> JioSaavn URL
                          </label>
                          <input
                            type="text"
                            value={jioSaavnUrl}
                            onChange={(e) => setJioSaavnUrl(e.target.value)}
                            placeholder="https://www.jiosaavn.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Amazon Music link */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-white/40 uppercase tracking-widest font-mono">
                            <span className="w-2 h-2 rounded-full bg-sky-400" /> Amazon Music URL
                          </label>
                          <input
                            type="text"
                            value={amazonMusicUrl}
                            onChange={(e) => setAmazonMusicUrl(e.target.value)}
                            placeholder="https://music.amazon.com/..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/5 text-white text-xs outline-none focus:border-sky-400"
                          />
                        </div>

                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSpotifyUrl('');
                            setAppleMusicUrl('');
                            setYoutubeMusicUrl('');
                            setYoutubeUrl('');
                            setJioSaavnUrl('');
                            setAmazonMusicUrl('');
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs transition-colors"
                        >
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveStreamingLinks(selectedLinkItem.type, selectedLinkItem.id)}
                          className="px-5 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center gap-1.5 rounded-xl shadow-lg transition-all"
                        >
                          <Save className="w-4 h-4" /> Save Connections
                        </button>
                      </div>

                    </div>
                  );
                })()
              ) : (
                /* Static select instruction card placeholder */
                <div className="border border-dashed border-white/10 bg-white/1 rounded-2.5xl p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <Link2 className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-white text-sm">No Active Selection</h4>
                    <p className="text-white/30 text-xs max-w-xs mx-auto">
                      Click any track or album compilation from the left catalog panel to begin managing streaming service connections.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
