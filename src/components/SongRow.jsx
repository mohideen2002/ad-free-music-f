import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
export const fmt = (s) => { s = Math.floor(s || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
export default function SongRow({ song, list, i }) {
  const { playList, current, playing, toggleLike, isLiked, addToQueue } = usePlayer()
  const nav = useNavigate()
  const active = current?.id === song.id
  return (
    <div className={'row' + (active ? ' active' : '')} onDoubleClick={() => playList(list, i)}>
      <button className="num" onClick={() => playList(list, i)}>{active && playing ? '▶' : i + 1}</button>
      <button type="button" className="cover-play" onClick={() => playList(list, i)} aria-label={`Play ${song.title} by ${song.artist}`}>
        <img src={song.image} alt="" loading="lazy" />
      </button>
      <div className="meta">
        <button type="button" className="title-play" onClick={() => playList(list, i)}>{song.title}</button>
        {song.artistId
          ? <button type="button" className="artist-link" onClick={() => nav('/artist/' + song.artistId)}>{song.artist}</button>
          : <span>{song.artist}</span>}
      </div>
      <span className="album">{song.album}</span>
      <button type="button" title="Add to queue" aria-label={`Add ${song.title} to queue`} className="row-action queue-add" onClick={() => addToQueue(song)}>＋</button>
      <button type="button" title={isLiked(song.id) ? 'Remove from liked songs' : 'Add to liked songs'}
        aria-label={isLiked(song.id) ? `Unlike ${song.title}` : `Like ${song.title}`}
        aria-pressed={isLiked(song.id)} className={'row-action heart' + (isLiked(song.id) ? ' on' : '')} onClick={() => toggleLike(song)}>♥</button>
      <span className="dur">{fmt(song.duration)}</span>
    </div>
  )
}
