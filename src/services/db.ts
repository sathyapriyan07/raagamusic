import { Artist, Album, Song, CuratedSection, RecentNotification, StreamingLinks } from '../types';
import { supabase } from './supabase';



// No bundled albums. Catalog data is user-created or loaded from Supabase.
const INITIAL_ALBUMS: Album[] = [];

// No bundled songs.
const INITIAL_SONGS: Song[] = [];

// No bundled curated rows.
const INITIAL_CURATED: CuratedSection[] = [];

// No bundled admin logs.
const INITIAL_LOGS: RecentNotification[] = [];

const parseJsonField = <T,>(value: unknown, fallback: T): T => {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const readLocalArray = <T,>(key: string): T[] => {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeArtist = (artist: any): Artist => ({
  id: artist.id,
  name: artist.name ?? '',
  image: artist.image ?? '',
  banner: artist.banner ?? '',
  primaryRole: artist.primaryRole ?? artist.primary_role ?? 'Singer',
  bio: artist.bio ?? '',
  roles: parseJsonField<string[]>(artist.roles, []),
  songCount: artist.songCount ?? artist.song_count ?? 0,
  albumCount: artist.albumCount ?? artist.album_count ?? 0,
});

const normalizeAlbum = (album: any): Album => ({
  id: album.id,
  name: album.name ?? '',
  artists: parseJsonField<{ id: string; name: string }[]>(album.artists, []),
  artwork: album.artwork ?? '',
  logoUrl: album.logoUrl ?? album.logo_url ?? '',
  releaseYear: Number(album.releaseYear ?? album.release_year) || new Date().getFullYear(),
  releaseDate: album.releaseDate ?? album.release_date ?? '',
  genre: album.genre ?? 'Pop',
  language: album.language ?? 'English',
  type: album.type ?? 'album',
  trackIds: parseJsonField<string[]>(album.trackIds ?? album.track_ids, []),
  runtime: album.runtime ?? '0 mins',
  streamingLinks: parseJsonField<StreamingLinks>(album.streamingLinks ?? album.streaming_links, {}),
  credits: parseJsonField<Album['credits']>(album.credits, {}),
});

const normalizeSong = (song: any): Song => ({
  id: song.id,
  name: song.name ?? '',
  albumId: song.albumId ?? song.album_id ?? '',
  albumName: song.albumName ?? song.album_name ?? '',
  artwork: song.artwork ?? '',
  artists: parseJsonField<{ id: string; name: string }[]>(song.artists, []),
  duration: song.duration ?? '3:30',
  explicit: Boolean(song.explicit),
  releaseDate: song.releaseDate ?? song.release_date ?? '',
  releaseYear: Number(song.releaseYear ?? song.release_year) || new Date().getFullYear(),
  genre: song.genre ?? 'Pop',
  language: song.language ?? 'English',
  youtubeVideoId: song.youtubeVideoId ?? song.youtube_video_id ?? '',
  trackNumber: Number(song.trackNumber ?? song.track_number) || 1,
  credits: parseJsonField<Song['credits']>(song.credits, {}),
  streamingLinks: parseJsonField<StreamingLinks>(song.streamingLinks ?? song.streaming_links, {}),
});

const normalizeCuratedSection = (section: any): CuratedSection => ({
  id: section.id,
  title: section.title ?? '',
  description: section.description ?? '',
  itemIds: parseJsonField<CuratedSection['itemIds']>(section.itemIds ?? section.item_ids, []),
});

const normalizeLog = (log: any): RecentNotification => ({
  id: log.id,
  timestamp: log.timestamp ?? log.created_at ?? new Date().toISOString(),
  message: log.message ?? '',
  type: log.type ?? 'add',
});

export class RaagaDatabase {
  static getArtists(): Artist[] {
    return readLocalArray<any>('raaga_artists').map(normalizeArtist);
  }

  static getAlbums(): Album[] {
    return readLocalArray<any>('raaga_albums').map(normalizeAlbum);
  }

  static getSongs(): Song[] {
    return readLocalArray<any>('raaga_songs').map(normalizeSong);
  }

  static getCurated(): CuratedSection[] {
    return readLocalArray<any>('raaga_curated').map(normalizeCuratedSection);
  }

  static getLogs(): RecentNotification[] {
    return readLocalArray<any>('raaga_logs').map(normalizeLog);
  }

  static saveArtists(data: Artist[]) {
    localStorage.setItem('raaga_artists', JSON.stringify(data));
    this.syncArtistsToSupabase().catch(() => {});
  }

  static saveAlbums(data: Album[]) {
    localStorage.setItem('raaga_albums', JSON.stringify(data));
    this.syncAlbumsToSupabase().catch(() => {});
  }

  static saveSongs(data: Song[]) {
    localStorage.setItem('raaga_songs', JSON.stringify(data));
    this.syncAlbumsToSupabase()
      .then(() => this.syncSongsToSupabase())
      .catch((error) => console.error('Error syncing songs to Supabase:', error));
  }

  static saveCurated(data: CuratedSection[]) {
    localStorage.setItem('raaga_curated', JSON.stringify(data));
    this.syncCuratedToSupabase().catch(() => {});
  }

  static addLog(message: string, type: 'import' | 'edit' | 'add') {
    const logs = this.getLogs();
    const newLog: RecentNotification = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message,
      type
    };
    localStorage.setItem('raaga_logs', JSON.stringify([newLog, ...logs].slice(0, 50)));
    this.syncLogToSupabase(newLog).catch(() => {});
  }

  static clearLocalDatabase() {
    localStorage.removeItem('raaga_artists');
    localStorage.removeItem('raaga_albums');
    localStorage.removeItem('raaga_songs');
    localStorage.removeItem('raaga_curated');
    localStorage.removeItem('raaga_logs');
  }

  static async hasSession(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return Boolean(session?.user);
    } catch {
      return false;
    }
  }

  // ─── Supabase Sync Methods ─────────────────────────────────────────

  static async initFromSupabase(): Promise<void> {
    try {
      const { data: artists, error } = await supabase.from('artists').select('*');
      if (!error && artists) {
        localStorage.setItem('raaga_artists', JSON.stringify(artists.map(normalizeArtist)));
      }
    } catch {}

    try {
      const { data: albums, error } = await supabase.from('albums').select('*');
      if (!error && albums) {
        localStorage.setItem('raaga_albums', JSON.stringify(albums.map(normalizeAlbum)));
      }
    } catch {}

    try {
      const { data: songs, error } = await supabase.from('songs').select('*');
      if (!error && songs) {
        localStorage.setItem('raaga_songs', JSON.stringify(songs.map(normalizeSong)));
      }
    } catch {}

    try {
      const { data: curated, error } = await supabase.from('curated_sections').select('*');
      if (!error && curated) {
        localStorage.setItem('raaga_curated', JSON.stringify(curated.map(normalizeCuratedSection)));
      }
    } catch {}

    try {
      const { data: logs, error } = await supabase.from('logs').select('*');
      if (!error && logs) {
        localStorage.setItem('raaga_logs', JSON.stringify(logs.map(normalizeLog)));
      }
    } catch {}
  }

  static async syncArtistsToSupabase(): Promise<void> {
    if (!(await this.hasSession())) return;

    const artists = this.getArtists();
    for (const artist of artists) {
      const { id, name, image, banner, primaryRole, bio, roles, songCount, albumCount } = artist;
      await supabase.from('artists').upsert({
        id, name, image, banner,
        primary_role: primaryRole,
        bio, roles,
        song_count: songCount ?? 0,
        album_count: albumCount ?? 0,
      }, { onConflict: 'id' });
    }
  }

  static async syncAlbumsToSupabase(): Promise<void> {
    if (!(await this.hasSession())) return;
    const albums = this.getAlbums();
    for (const album of albums) {
      const { id, name, artists, artwork, logoUrl, releaseYear, releaseDate, genre, language, type, trackIds, runtime, streamingLinks, credits } = album;
      const { error } = await supabase.from('albums').upsert({
        id, name,
        artists,
        artwork,
        logo_url: logoUrl ?? null,
        release_year: releaseYear,
        release_date: releaseDate,
        genre, language, type,
        track_ids: trackIds,
        runtime,
        streaming_links: streamingLinks ?? {},
        credits: credits ?? {},
      }, { onConflict: 'id' });

      if (error) {
        console.error(`Error syncing album "${id}" to Supabase:`, error);
      }
    }
  }

  static async syncSongsToSupabase(): Promise<void> {
    if (!(await this.hasSession())) return;

    const songs = this.getSongs();
    const albumIds = new Set(this.getAlbums().map(album => album.id));
    for (const song of songs) {
      const { id, name, albumId, albumName, artwork, artists, duration, explicit, releaseDate, releaseYear, genre, language, youtubeVideoId, trackNumber, credits, streamingLinks } = song;
      const { error } = await supabase.from('songs').upsert({
        id, name,
        album_id: albumId && albumIds.has(albumId) ? albumId : null,
        album_name: albumName ?? null,
        artwork: artwork ?? null,
        artists,
        duration, explicit,
        release_date: releaseDate,
        release_year: releaseYear,
        genre, language,
        youtube_video_id: youtubeVideoId ?? null,
        track_number: trackNumber,
        credits: credits ?? {},
        streaming_links: streamingLinks ?? {},
      }, { onConflict: 'id' });

      if (error) {
        console.error(`Error syncing song "${id}" to Supabase:`, error);
      }
    }
  }

  static async syncCuratedToSupabase(): Promise<void> {
    if (!(await this.hasSession())) return;
    const sections = this.getCurated();
    for (const section of sections) {
      const { error } = await supabase.from('curated_sections').upsert({
        id: section.id,
        title: section.title,
        description: section.description ?? '',
        item_ids: section.itemIds,
      }, { onConflict: 'id' });

      if (error) {
        console.error(`Error syncing curated section "${section.id}" to Supabase:`, error);
      }
    }
  }

  static async syncLogsToSupabase(): Promise<void> {
    if (!(await this.hasSession())) return;

    const logs = this.getLogs();
    for (const log of logs) {
      await supabase.from('logs').upsert({
        id: log.id,
        timestamp: log.timestamp,
        message: log.message,
        type: log.type,
      }, { onConflict: 'id' });
    }
  }

  static async syncAllToSupabase(): Promise<void> {
    await this.syncArtistsToSupabase();
    await this.syncAlbumsToSupabase();
    await this.syncSongsToSupabase();
    await this.syncCuratedToSupabase();
  }

  static async syncLogToSupabase(log: RecentNotification): Promise<void> {
    if (!(await this.hasSession())) return;

    await supabase.from('logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      message: log.message,
      type: log.type,
    });
  }
}

// iTunes Search Integration API Helper
export interface ITunesSongResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionId: number;
  collectionName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  country: string;
  trackTimeMillis: number;
  trackViewUrl: string;
  artistViewUrl?: string;
  collectionViewUrl?: string;
  previewUrl?: string;
  trackExplicitness?: string;
}

export interface ITunesAlbumResult {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  primaryGenreName: string;
  releaseDate: string;
  trackCount: number;
}

export async function searchITunesSongs(term: string): Promise<ITunesSongResult[]> {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=25`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching iTunes songs:', err);
    return [];
  }
}

export async function searchITunesAlbums(term: string): Promise<ITunesAlbumResult[]> {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=album&limit=25`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching iTunes albums:', err);
    return [];
  }
}

// Search tracks in a dynamic album
export async function fetchITunesAlbumTracks(collectionId: number): Promise<ITunesSongResult[]> {
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`);
    if (!response.ok) return [];
    const data = await response.json();
    // The first result is the album metadata, the subsequent ones are songs
    return (data.results || []).slice(1) as ITunesSongResult[];
  } catch (err) {
    console.error('Error lookup iTunes album songs:', err);
    return [];
  }
}

// Parse multiple artist names from an iTunes artistName field
function parseArtistNames(artistName: string): string[] {
  const parts = artistName
    .split(/\s+(?:feat\.|featuring|ft\.|&|with|vs\.)\s+|\s*,\s*/gi)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [artistName];
}

// Upsert (update or insert) multiple artists into the database
function upsertArtists(
  names: string[],
  existingArtists: Artist[],
  songCountInc: number = 1,
  albumCountInc: number = 0,
): { artistRefs: { id: string; name: string }[] } {
  const artistRefs: { id: string; name: string }[] = [];
  for (const name of names) {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-') || `artist-${Date.now()}`;
    let artist = existingArtists.find(a => a.id === id);
    if (!artist) {
      artist = {
        id,
        name,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
        primaryRole: 'Singer',
        bio: `${name} is a popular artist recorded on Apple Music / iTunes directories. Loaded dynamically onto Raaga.`,
        roles: ['Singer'],
        songCount: songCountInc,
        albumCount: albumCountInc,
      };
      existingArtists.push(artist);
    } else {
      if (songCountInc) artist.songCount = (artist.songCount || 0) + songCountInc;
      if (albumCountInc) artist.albumCount = (artist.albumCount || 0) + albumCountInc;
    }
    artistRefs.push({ id, name });
  }
  return { artistRefs };
}

// Process track into standard Raaga local relational store
export function importSongIntoDatabase(item: ITunesSongResult): { song: Song; album: Album; artistRefs: { id: string; name: string }[] } {
  const songs = RaagaDatabase.getSongs();
  const albums = RaagaDatabase.getAlbums();
  const artists = RaagaDatabase.getArtists();

  const artistNames = parseArtistNames(item.artistName);
  const albumId = item.collectionId ? `album-${item.collectionId}` : `album-single-${Date.now()}`;
  const songId = `song-${item.trackId || Date.now()}`;

  // 1. Upsert all artists
  const { artistRefs } = upsertArtists(artistNames, artists, 1, 1);

  // Helper calculation of duration
  const mins = Math.floor(item.trackTimeMillis / 60000);
  const secs = Math.floor((item.trackTimeMillis % 60000) / 1000);
  const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // 2. Process Album
  const allArtistNames = artistRefs.map(a => a.name);
  let album = albums.find(al => al.id === albumId);
  if (!album) {
    album = {
      id: albumId,
      name: item.collectionName || `${item.trackName} - Single`,
      artists: artistRefs,
      artwork: item.artworkUrl100.replace('100x100bb', '600x600bb') || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      releaseYear: new Date(item.releaseDate).getFullYear() || 2026,
      releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2026-01-01',
      genre: item.primaryGenreName || 'Pop',
      language: getLanguageByCountry(item.country) || 'English',
      type: item.collectionName ? 'album' : 'single',
      trackIds: [songId],
      runtime: `${mins} mins`,
      streamingLinks: {
        appleMusic: item.collectionViewUrl || item.trackViewUrl,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(item.collectionName || '')}`
      }
    };
    albums.push(album);
  } else {
    if (!album.trackIds.includes(songId)) {
      album.trackIds.push(songId);
    }
  }

  // 3. Process Song
  let song = songs.find(s => s.id === songId);
  if (!song) {
    song = {
      id: songId,
      name: item.trackName,
      albumId: albumId,
      albumName: album.name,
      artwork: album.artwork,
      artists: artistRefs,
      duration: durationStr,
      explicit: item.trackExplicitness === 'explicit',
      releaseDate: album.releaseDate,
      releaseYear: album.releaseYear,
      genre: album.genre,
      language: album.language,
      trackNumber: 1,
      credits: {
        singer: allArtistNames,
        composer: allArtistNames
      },
      streamingLinks: {
        appleMusic: item.trackViewUrl,
        spotify: `https://open.spotify.com/search/${encodeURIComponent(item.trackName + ' ' + allArtistNames.join(' '))}`
      }
    };
    songs.push(song);
  }

  // Save database
  RaagaDatabase.saveArtists(artists);
  RaagaDatabase.saveAlbums(albums);
  RaagaDatabase.saveSongs(songs);
  RaagaDatabase.addLog(`Imported song "${song.name}" by ${allArtistNames.join(', ')}`, 'import');

  return { song, album, artistRefs };
}

// Process Album fully with its child tracks
export async function importAlbumIntoDatabase(albumItem: ITunesAlbumResult): Promise<Album> {
  const albums = RaagaDatabase.getAlbums();
  const artists = RaagaDatabase.getArtists();
  const songs = RaagaDatabase.getSongs();

  const albumArtistNames = parseArtistNames(albumItem.artistName);
  const albumId = `album-${albumItem.collectionId || Date.now()}`;

  // 1. Upsert all album artists
  const { artistRefs: albumArtistRefs } = upsertArtists(albumArtistNames, artists, albumItem.trackCount, 1);

  // 2. Fetch tracks
  const itunesTracks = await fetchITunesAlbumTracks(albumItem.collectionId);
  const songIds: string[] = [];

  // 3. Process Tracks
  let calculatedRunTimeMinutes = 0;
  itunesTracks.forEach((track, index) => {
    const songId = `song-${track.trackId || (Date.now() + index)}`;
    songIds.push(songId);

    const mins = Math.floor(track.trackTimeMillis / 60000);
    const secs = Math.floor((track.trackTimeMillis % 60000) / 1000);
    calculatedRunTimeMinutes += mins;

    const trackArtistNames = parseArtistNames(track.artistName);
    const { artistRefs: trackArtistRefs } = upsertArtists(trackArtistNames, artists, 1, 0);
    const trackArtistNameList = trackArtistRefs.map(a => a.name);

    let song = songs.find(s => s.id === songId);
    if (!song) {
      song = {
        id: songId,
        name: track.trackName,
        albumId: albumId,
        albumName: albumItem.collectionName,
        artwork: albumItem.artworkUrl100.replace('100x100bb', '600x600bb'),
        artists: trackArtistRefs,
        duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
        explicit: track.trackExplicitness === 'explicit',
        releaseDate: track.releaseDate ? track.releaseDate.split('T')[0] : '2026-01-01',
        releaseYear: new Date(track.releaseDate).getFullYear() || 2026,
        genre: track.primaryGenreName || 'Pop',
        language: getLanguageByCountry(track.country) || 'English',
        trackNumber: index + 1,
        credits: {
          singer: trackArtistNameList,
          composer: trackArtistNameList
        },
        streamingLinks: {
          appleMusic: track.trackViewUrl,
          spotify: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + trackArtistNameList.join(' '))}`
        }
      };
      songs.push(song);
    }
  });

  // 4. Upsert Album
  let album = albums.find(al => al.id === albumId);
  if (!album) {
    album = {
      id: albumId,
      name: albumItem.collectionName,
      artists: albumArtistRefs,
      artwork: albumItem.artworkUrl100.replace('100x100bb', '600x600bb'),
      releaseYear: new Date(albumItem.releaseDate).getFullYear() || 2026,
      releaseDate: albumItem.releaseDate ? albumItem.releaseDate.split('T')[0] : '2026-01-01',
      genre: albumItem.primaryGenreName || 'Pop',
      language: 'English',
      type: 'album',
      trackIds: songIds,
      runtime: `${calculatedRunTimeMinutes || 35} mins`,
      streamingLinks: {
        spotify: `https://open.spotify.com/search/${encodeURIComponent(albumItem.collectionName)}`
      }
    };
    albums.push(album);
  } else {
    album.trackIds = Array.from(new Set([...album.trackIds, ...songIds]));
  }

  RaagaDatabase.saveArtists(artists);
  RaagaDatabase.saveAlbums(albums);
  RaagaDatabase.saveSongs(songs);
  RaagaDatabase.addLog(`Imported album "${album.name}" (${songIds.length} songs) by ${albumArtistNames.join(', ')}`, 'import');

  return album;
}

// Utility mapper to get language
function getLanguageByCountry(country: string): string {
  if (!country) return 'English';
  switch (country.toUpperCase()) {
    case 'IN': return 'Hindi'; // Or South regional based on details
    case 'JP': return 'Japanese';
    case 'KR': return 'Korean';
    case 'FR': return 'French';
    case 'ES': return 'Spanish';
    default: return 'English';
  }
}

// Upload artist image/banner file to Supabase Storage
export async function uploadArtistFile(
  artistId: string,
  file: File,
  type: 'image' | 'banner'
): Promise<string | null> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${artistId}/${type}.${ext}`;

    const { error } = await supabase.storage
      .from('artist-images')
      .upload(filePath, file, { upsert: true });

    if (error) {
      if (error.message?.includes('bucket') || error.message?.includes('not found') || error.message?.includes('row-level')) {
        const { error: createError } = await supabase.storage.createBucket('artist-images', {
          public: true,
        });
        if (createError) {
          console.error('Could not create storage bucket:', createError);
          return null;
        }
        const { error: retryError } = await supabase.storage
          .from('artist-images')
          .upload(filePath, file, { upsert: true });
        if (retryError) {
          console.error('Upload failed after bucket creation:', retryError);
          return null;
        }
      } else {
        console.error('Upload error:', error);
        return null;
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('artist-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('File upload error:', err);
    return null;
  }
}

export interface TMDBLogoResult {
  id: number;
  title: string;
  poster_path?: string;
  logoUrl: string;
  backdrop_path?: string;
  logos?: string[];
}

export async function searchTMDBLogos(query: string, apiKey?: string): Promise<TMDBLogoResult[]> {
  if (!apiKey) return [];

  try {
    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`
    );
    if (!searchResponse.ok) return [];
    const searchData = await searchResponse.json();
    const movies = (searchData.results || []).slice(0, 5);

    const results: TMDBLogoResult[] = [];
    for (const movie of movies) {
      const imagesResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/images?include_image_language=en,null&api_key=${apiKey}`
      );
      if (!imagesResponse.ok) continue;
      const imagesData = await imagesResponse.json();

      const movieLogos: any[] = imagesData.logos || [];
      const backdrops: any[] = imagesData.backdrops || [];

      const logoUrls = movieLogos.map((l: any) =>
        `https://image.tmdb.org/t/p/original${l.file_path}`
      );
      const backdropPath = backdrops[0]?.file_path;

      results.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : undefined,
        logoUrl: logoUrls[0] || (backdropPath
          ? `https://image.tmdb.org/t/p/original${backdropPath}`
          : ''),
        backdrop_path: backdropPath
          ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
          : undefined,
        logos: logoUrls.length > 0 ? logoUrls : undefined,
      });
    }
    return results;
  } catch (err) {
    console.error('Error in TMDB search:', err);
    return [];
  }
}
