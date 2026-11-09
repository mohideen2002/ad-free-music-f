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
      <img src={song.image} alt="" loading="lazy" />
      <div className="meta"><b>{song.title}</b>
        <span className={song.artistId ? 'link' : ''} onClick={() => song.artistId && nav('/artist/' + song.artistId)}>{song.artist}</span></div>
      <span className="album">{song.album}</span>
      <button title="Add to queue" className="heart" onClick={() => addToQueue(song)}>＋</button>
      <button className={'heart' + (isLiked(song.id) ? ' on' : '')} onClick={() => toggleLike(song)}>♥</button>
      <span className="dur">{fmt(song.duration)}</span>
    </div>
  )
}
