-- Remove the previously bundled sample catalog rows.
-- This leaves auth users and profiles intact.

DELETE FROM public.curated_sections
WHERE id IN (
  'editor-picks',
  'trending-songs',
  'legendary-artists',
  'new-releases'
);

DELETE FROM public.logs
WHERE id IN ('log-1', 'log-2')
   OR message IN (
    'System initialization loaded.',
    'Standard content metadata indexed successfully.'
  );

DELETE FROM public.songs
WHERE id IN (
  'song-jai-ho',
  'song-o-saya',
  'song-hukum',
  'song-kaavaalaa',
  'song-cornfield',
  'song-stay',
  'song-anti-hero',
  'song-adventure',
  'song-hymn-weekend'
);

DELETE FROM public.albums
WHERE id IN (
  'slumdog',
  'interstellar',
  'jailer',
  'midnights',
  'head-full'
);

DELETE FROM public.artists
WHERE id IN (
  'ar-rahman',
  'hans-zimmer',
  'anirudh',
  'taylor-swift',
  'coldplay'
);
