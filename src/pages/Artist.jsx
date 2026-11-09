import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getArtist } from '../api.js'
import { usePlayer } from '../PlayerContext.jsx'
import SongRow from '../components/SongRow.jsx'
import Section from '../components/Section.jsx'
export default function Artist() {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [err, setErr] = useState(false)
  const { playList } = usePlayer()
  useEffect(() => { setA(null); setErr(false); getArtist(id).then(setA).catch(() => setErr(true)) }, [id])
  if (err) return <div className="page muted">Could not load this artist.</div>
  if (!a) return <div className="page muted">Loading…</div>
  return (
    <div className="page">
      <div className="hero"><img className="cover round" src={a.image} alt="" /><div><small>ARTIST</small><h1>{a.name}</h1>
        {a.followers && <span>{Number(a.followers).toLocaleString()} followers</span>}</div></div>
      <button className="bigplay" onClick={() => playList(a.songs, 0)}>▶</button>
      <h2>Popular</h2>
      {a.songs.map((s, i) => <SongRow key={s.id} song={s} list={a.songs} i={i} />)}
      <Section title="Albums" kind="albums" items={a.albums} />
    </div>
  )
}
