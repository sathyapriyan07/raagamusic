export interface StreamingLinks {
  spotify?: string;
  appleMusic?: string;
  youtubeMusic?: string;
  jioSaavn?: string;
  amazonMusic?: string;
  youtube?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  banner?: string;
  primaryRole: string; // e.g. "Composer", "Singer", "Lyricist"
  bio: string;
  roles: string[]; // List of roles: ["Singer", "Composer", "Producer"]
  songCount?: number;
  albumCount?: number;
}

export interface Album {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  artwork: string;
  logoUrl?: string; // TMDB integration for album title logo
  releaseYear: number;
  releaseDate: string;
  genre: string;
  language: string;
  type: 'album' | 'single' | 'ep';
  trackIds: string[];
  runtime: string; // e.g., "42 mins" or string or seconds
  streamingLinks?: StreamingLinks;
  credits?: {
    producer?: string[];
    composers?: string[];
    engineers?: string[];
  };
}

export interface Song {
  id: string;
  name: string;
  albumId?: string;
  albumName?: string;
  artwork?: string;
  artists: { id: string; name: string }[];
  duration: string; // e.g., "3:45"
  explicit: boolean;
  releaseDate: string;
  releaseYear: number;
  genre: string;
  language: string;
  youtubeVideoId?: string; // YouTube embed
  trackNumber: number;
  credits: {
    singer?: string[];
    composer?: string[];
    lyricist?: string[];
    producer?: string[];
    musicDirector?: string[];
  };
  streamingLinks?: StreamingLinks;
}

export interface CuratedSection {
  id: string;
  title: string;
  description?: string;
  itemIds: { type: 'song' | 'album' | 'artist'; id: string }[];
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  username: string;
  avatar?: string;
}

export interface RecentNotification {
  id: string;
  timestamp: string;
  message: string;
  type: 'import' | 'edit' | 'add';
}
