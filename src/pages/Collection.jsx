import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAlbum, getPlaylist } from '../api.js'
import SongRow from '../components/SongRow.jsx'
import BigPlayButton from '../components/BigPlayButton.jsx'
export default function Collection({ type }) {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [err, setErr] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  useEffect(() => {
    let active = true
    setA(null)
    setErr(false)
    setDetailsExpanded(false)
    ;(type === 'album' ? getAlbum : getPlaylist)(id)
      .then((result) => { if (active) setA(result) })
      .catch(() => { if (active) setErr(true) })
    return () => { active = false }
  }, [id, type, attempt])
  if (err) return <div className="page error-state"><p>Could not load this {type}.</p><button type="button" className="more" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>
  if (!a) return <div className="page muted">Loading…</div>
  const description = a.sub || ''
  const canExpandDescription = type === 'playlist' && description.length > 120
  return (
    <div className="page collection-page">
      <header className="collection-hero">
        <img className="cover" src={a.image} alt={`${a.title} cover`} />
        <div className="collection-info">
          <small>{type === 'album' ? 'ALBUM' : 'PLAYLIST'}</small>
          <h1>{a.title}</h1>
          {description && <p className={'collection-description' + (detailsExpanded ? ' expanded' : '')}>{description}</p>}
          {canExpandDescription && <button type="button" className="description-toggle" aria-expanded={detailsExpanded}
            onClick={() => setDetailsExpanded((expanded) => !expanded)}>{detailsExpanded ? 'Show less' : 'Read more'}</button>}
          <p className="collection-count">{a.songs.length} {a.songs.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </header>
      <div className="collection-actions">
        <BigPlayButton list={a.songs} label={a.title} />
      </div>
      {a.songs.length > 0
        ? <section className="collection-tracks" aria-label={`${a.title} tracks`}>
          <h2>Tracks</h2>
          {a.songs.map((s, i) => <SongRow key={s.id} song={s} list={a.songs} i={i} />)}
        </section>
        : <div className="empty-state"><b>No tracks available</b><span>There are no playable songs in this {type} yet.</span></div>}
    </div>
  )
}
