import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAlbum, getPlaylist } from '../api.js'
import { usePlayer } from '../PlayerContext.jsx'
import SongRow from '../components/SongRow.jsx'
export default function Collection({ type }) {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [err, setErr] = useState(false)
  const { playList } = usePlayer()
  useEffect(() => { setA(null); setErr(false); (type === 'album' ? getAlbum : getPlaylist)(id).then(setA).catch(() => setErr(true)) }, [id, type])
  if (err) return <div className="page muted">Could not load this {type}.</div>
  if (!a) return <div className="page muted">Loading…</div>
  return (
    <div className="page">
      <div className="hero"><img className="cover" src={a.image} alt="" /><div><small>{type.toUpperCase()}</small><h1>{a.title}</h1><span>{a.sub} · {a.songs.length} songs</span></div></div>
      <button className="bigplay" onClick={() => playList(a.songs, 0)}>▶</button>
      {a.songs.map((s, i) => <SongRow key={s.id} song={s} list={a.songs} i={i} />)}
    </div>
  )
}
