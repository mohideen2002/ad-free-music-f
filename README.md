# Musify

Musify is a mobile-first music discovery and playback app built with React and Vite.

## Run locally

1. Install dependencies with `npm install`.
2. Run `npm run dev`.
3. Open the local URL printed by Vite (by default, `http://localhost:5173`).

The Vite development server proxies `/api/*` to the hosted JioSaavn API configured in `vite.config.js`. Vercel deployments use the rewrite in `vercel.json`. To use a different API, update the corresponding proxy/rewrite configuration.

## Main features

- Search songs, albums, artists, and playlists.
- Browse Tamil-first music recommendations.
- Play tracks, manage and reorder the queue, adjust volume and audio quality, and save liked songs.
- Create and manage local playlists, and get recommendations based on liked and recently played tracks.
- View lyrics when provided by the music API, and use a sleep timer to stop after a set time or at the end of a track.
- Use the persistent mobile player, expanded now-playing view, and mobile bottom navigation.

The app's browser player supports background/media controls where the browser provides the Media Session API.
