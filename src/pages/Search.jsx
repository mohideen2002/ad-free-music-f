import { useEffect, useState } from 'react'
import { searchSongs, searchAlbums, searchArtists, searchPlaylists } from '../api.js'
import SongRow from '../components/SongRow.jsx'
import Section from '../components/Section.jsx'

const TABS = ['All', 'Songs', 'Albums', 'Artists', 'Playlists']
const saved = () => { try { return JSON.parse(localStorage.getItem('searches')) || [] } catch { return [] } }
export default function Search() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const [r, setR] = useState({ songs: [], albums: [], artists: [], playlists: [] })
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState(saved)

  useEffect(() => {
    if (!q.trim()) return setR({ songs: [], albums: [], artists: [], playlists: [] })
    setLoading(true); setPage(0)
    const t = setTimeout(async () => {
      const safe = (p) => p.catch(() => [])
      const [songs, albums, artists, playlists] = await Promise.all([safe(searchSongs(q, 0, 20)), safe(searchAlbums(q)), safe(searchArtists(q)), safe(searchPlaylists(q))])
      setR({ songs, albums, artists, playlists }); setLoading(false)
      const s = [q.trim(), ...recent.filter((x) => x !== q.trim())].slice(0, 8)
      setRecent(s); localStorage.setItem('searches', JSON.stringify(s))
    }, 500)
    return () => clearTimeout(t)
  }, [q])

  const more = async () => {
    const p = page + 1
    const next = await searchSongs(q, p, 20).catch(() => [])
    setR((o) => ({ ...o, songs: [...o.songs, ...next.filter((n) => !o.songs.some((s) => s.id === n.id))] })); setPage(p)
  }
  const show = (t) => tab === 'All' || tab === t
  const none = q && !loading && !Object.values(r).some((a) => a.length)
  return (
    <div className="page">
      <input className="search" autoFocus placeholder="Search Tamil songs, albums, artists…" value={q} onChange={(e) => setQ(e.target.value)} />
      {!q && <div className="chips">{recent.map((x) => <button key={x} onClick={() => setQ(x)}>🕘 {x}</button>)}</div>}
      <div className="chips">{TABS.map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {loading && <p className="muted">Searching…</p>}
      {none && <p className="muted">No results found for “{q}”.</p>}
      {show('Songs') && r.songs.length > 0 && <section><h2>Songs</h2>
        {(tab === 'All' ? r.songs.slice(0, 6) : r.songs).map((s, i) => <SongRow key={s.id} song={s} list={r.songs} i={i} />)}
        {tab === 'Songs' && <button className="more" onClick={more}>Load more</button>}</section>}
      {show('Artists') && <Section title="Artists" kind="artists" items={r.artists} />}
      {show('Albums') && <Section title="Albums" kind="albums" items={r.albums} />}
      {show('Playlists') && <Section title="Playlists" kind="playlists" items={r.playlists} />}
      {!q && <p className="muted">Try “sawadeeka”, “anirudh” or “kolaveri”. Tamil results come first.</p>}
    </div>
  )
}
