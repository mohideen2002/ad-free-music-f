import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import ArtistNames from './ArtistNames.jsx'
import Icon from './Icon.jsx'
export const fmt = (s) => { s = Math.floor(s || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
export default function SongRow({ song, list, i, playlistId }) {
  const { playList, current, playing, toggleLike, isLiked, addToQueue, playNext, playlists, addSongToPlaylist, removeSongFromPlaylist } = usePlayer()
  const nav = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = current?.id === song.id
  return (
    <div className={'row' + (active ? ' active' : '')} onDoubleClick={() => playList(list, i)}>
      <button className="num" onClick={() => playList(list, i)}>{active && playing ? '▶' : i + 1}</button>
      <button type="button" className="cover-play" onClick={() => playList(list, i)} aria-label={`Play ${song.title} by ${song.artist}`}>
        <img src={song.image} alt="" loading="lazy" />
      </button>
      <div className="meta">
        <button type="button" className="title-play" onClick={() => playList(list, i)}>{song.title}</button>
        <ArtistNames artists={song.artistLinks} fallback={song.artist} />
      </div>
      <span className="album">{song.album}</span>
      <button type="button" title="Add to queue" aria-label={`Add ${song.title} to queue`} className="row-action queue-add" onClick={() => addToQueue(song)}>＋</button>
      <div className="row-menu-wrap">
        <button type="button" className="row-action" aria-label={`More actions for ${song.title}`} aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}>⋯</button>
        {menuOpen && <div className="row-menu" role="menu">
          <button type="button" role="menuitem" className="mobile-queue-action" onClick={() => { addToQueue(song); setMenuOpen(false) }}>Add to queue</button>
          <button type="button" role="menuitem" onClick={() => { playNext(song); setMenuOpen(false) }}>Play next</button>
          {playlists.length > 0
            ? <><span className="row-menu-label">Add to playlist</span>{playlists.map((playlist) =>
              <button type="button" role="menuitem" key={playlist.id} onClick={() => { addSongToPlaylist(playlist.id, song); setMenuOpen(false) }}>
                {playlist.title}
              </button>)}</>
            : <button type="button" role="menuitem" onClick={() => nav('/library')}>Create a playlist</button>}
          {playlistId && <button type="button" role="menuitem" onClick={() => { removeSongFromPlaylist(playlistId, song.id); setMenuOpen(false) }}>Remove from this playlist</button>}
        </div>}
      </div>
      <button type="button" title={isLiked(song.id) ? 'Remove from liked songs' : 'Add to liked songs'}
        aria-label={isLiked(song.id) ? `Unlike ${song.title}` : `Like ${song.title}`}
        aria-pressed={isLiked(song.id)} className={'row-action heart' + (isLiked(song.id) ? ' on' : '')} onClick={() => toggleLike(song)}>
        <Icon name="heart" />
      </button>
      <span className="dur">{fmt(song.duration)}</span>
    </div>
  )
}
