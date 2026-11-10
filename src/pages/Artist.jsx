import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getArtist } from '../api.js'
import SongRow from '../components/SongRow.jsx'
import Section from '../components/Section.jsx'
import BigPlayButton from '../components/BigPlayButton.jsx'
export default function Artist() {
  const { id } = useParams()
  const [a, setA] = useState(null)
  const [err, setErr] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setA(null)
    setErr(false)
    getArtist(id).then((result) => { if (active) setA(result) }).catch(() => { if (active) setErr(true) })
    return () => { active = false }
  }, [id, attempt])
  if (err) return <div className="page error-state"><p>Could not load this artist.</p><button type="button" className="more" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>
  if (!a) return <div className="page muted">Loading…</div>
  return (
    <div className="page">
      <div className="hero"><img className="cover round" src={a.image} alt="" /><div><small>ARTIST</small><h1>{a.name}</h1>
        <div className="artist-stats">
          {a.followers != null && <span>{Number(a.followers).toLocaleString()} followers</span>}
          {a.fans != null && <span>{Number(a.fans).toLocaleString()} fans</span>}
          {a.dominantType && <span>{a.dominantType}</span>}
          {a.dominantLanguage && <span>{a.dominantLanguage}</span>}
          {a.dob && <span>Born {a.dob}</span>}
          {a.verified && <span>Verified artist</span>}
          {a.radioAvailable && <span>Artist radio available</span>}
        </div></div></div>
      {a.songs.length > 0 && <BigPlayButton list={a.songs} label={a.name} />}
      {a.songs.length > 0 && <h2>Popular</h2>}
      {a.songs.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} list={a.songs} i={i} />)}
      <Section title="Albums" kind="albums" items={a.albums} />
      <Section title="Singles" kind="albums" items={a.singles} />
      <Section title="Similar Artists" kind="artists" items={a.similarArtists} />
      {(a.bio.length > 0 || a.availableLanguages.length > 0 || a.links.length > 0) && <section className="artist-about">
        <h2>About {a.name}</h2>
        {a.bio.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        {a.availableLanguages.length > 0 && <div className="artist-languages">
          <b>Available languages</b>
          <span>{a.availableLanguages.join(', ')}</span>
        </div>}
        {a.links.length > 0 && <div className="artist-links">
          {a.links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}
        </div>}
      </section>}
    </div>
  )
}
