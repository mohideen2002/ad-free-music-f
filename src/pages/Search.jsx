import { useEffect, useRef, useState } from 'react'
import { searchSongs, searchAlbums, searchArtists, searchPlaylists } from '../api.js'
import SongRow from '../components/SongRow.jsx'
import Section from '../components/Section.jsx'

const TABS = ['All', 'Songs', 'Albums', 'Artists', 'Playlists']
const emptyResults = () => ({ songs: [], albums: [], artists: [], playlists: [] })
const saved = () => { try { return JSON.parse(localStorage.getItem('searches')) || [] } catch { return [] } }

export default function Search() {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const [r, setR] = useState(emptyResults)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [failedTypes, setFailedTypes] = useState([])
  const [moreError, setMoreError] = useState('')
  const [recent, setRecent] = useState(saved)
  const requestId = useRef(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const query = q.trim()
    const id = ++requestId.current
    let cancelled = false
    setR(emptyResults())
    setPage(0)
    setError('')
    setFailedTypes([])
    setMoreError('')
    setLoadingMore(false)
    if (!query) {
      setLoading(false)
      return () => { cancelled = true }
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const results = await Promise.allSettled([
        searchSongs(query, 0, 20), searchAlbums(query), searchArtists(query), searchPlaylists(query),
      ])
      if (cancelled || id !== requestId.current) return
      const [songs, albums, artists, playlists] = results.map((item) => item.status === 'fulfilled' ? item.value : [])
      setR({ songs, albums, artists, playlists })
      setFailedTypes(results.flatMap((item, index) => item.status === 'rejected' ? [TABS[index + 1]] : []))
      if (results.every((item) => item.status === 'rejected')) {
        setError('Search is unavailable right now. Check your connection and try again.')
      } else if (results.some((item) => item.status === 'rejected')) {
        setError('Some results could not be loaded. Try again for a complete search.')
      }
      setLoading(false)
      const nextRecent = [query, ...recent.filter((item) => item !== query)].slice(0, 8)
      setRecent(nextRecent)
      try { localStorage.setItem('searches', JSON.stringify(nextRecent)) } catch {}
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [q, attempt])

  const more = async () => {
    const query = q.trim()
    const nextPage = page + 1
    const id = requestId.current
    setLoadingMore(true)
    setMoreError('')
    try {
      const next = await searchSongs(query, nextPage, 20)
      if (id !== requestId.current) return
      setR((old) => ({ ...old, songs: [...old.songs, ...next.filter((song) => !old.songs.some((item) => item.id === song.id))] }))
      setPage(nextPage)
    } catch {
      if (id === requestId.current) setMoreError('Could not load more songs. Please try again.')
    } finally {
      if (id === requestId.current) setLoadingMore(false)
    }
  }

  const show = (type) => tab === 'All' || tab === type
  const selectedHasResults = tab === 'All'
    ? Object.values(r).some((items) => items.length)
    : r[tab.toLowerCase()].length > 0
  const selectedFailed = tab === 'All'
    ? failedTypes.length === TABS.length - 1
    : failedTypes.includes(tab)
  const none = q.trim() && !loading && !selectedHasResults && !selectedFailed

  return (
    <div className="page">
      <div className="search-wrap">
        <label className="sr-only" htmlFor="music-search">Search songs, albums, artists, and playlists</label>
        <input id="music-search" className="search" placeholder="What do you want to play?" value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQ('')}>×</button>}
      </div>
      {!q && recent.length > 0 && <div className="recent-searches"><h2>Recent searches</h2><div className="chips">{recent.map((item) => <button type="button" key={item} onClick={() => setQ(item)}>◷ {item}</button>)}</div></div>}
      <div className="chips search-tabs" role="tablist" aria-label="Search result types">
        {TABS.map((type) => <button type="button" role="tab" aria-selected={tab === type} key={type}
          className={tab === type ? 'on' : ''} onClick={() => setTab(type)}>{type}</button>)}
      </div>
      {loading && <p className="search-status" role="status"><span className="spinner" />Searching…</p>}
      {error && <div className="inline-notice" role="status"><span>{error}</span><button type="button" className="retry-button" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>}
      {none && <p className="empty-state"><b>No {tab === 'All' ? 'results' : tab.toLowerCase()} found</b><span>Try a different title, artist, or album.</span></p>}
      {show('Songs') && r.songs.length > 0 && <section><h2>Songs</h2>
        {(tab === 'All' ? r.songs.slice(0, 6) : r.songs).map((song, i) => <SongRow key={song.id} song={song} list={r.songs} i={i} />)}
        {tab === 'Songs' && <>
          {moreError && <p className="inline-notice" role="alert">{moreError}</p>}
          <button type="button" className="more" onClick={more} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more songs'}</button>
        </>}
      </section>}
      {show('Artists') && <Section title="Artists" kind="artists" items={r.artists} />}
      {show('Albums') && <Section title="Albums" kind="albums" items={r.albums} />}
      {show('Playlists') && <Section title="Playlists" kind="playlists" items={r.playlists} />}
      {!q && <p className="muted search-hint">Try “sawadeeka”, “anirudh” or “kolaveri”. Tamil results come first.</p>}
    </div>
  )
}
