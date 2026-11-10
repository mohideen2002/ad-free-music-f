import { useEffect, useRef, useState } from 'react'
import { searchSongs, searchAlbums, searchPlaylists, searchArtists, dedupe } from '../api.js'
import { usePlayer } from '../PlayerContext.jsx'
import Section, { CardGrid } from '../components/Section.jsx'
import { Link } from 'react-router-dom'

const SECTIONS = [
  { t: 'Tamil Trending', kind: 'songs', f: () => searchSongs('trending', 0, 12) },
  { t: 'Latest Tamil Hits', kind: 'songs', f: () => searchSongs('latest hits', 0, 12) },
  { t: 'Tamil Playlists', kind: 'playlists', f: () => searchPlaylists('tamil hits') },
  { t: 'Anirudh Ravichander', kind: 'songs', f: () => searchSongs('anirudh', 0, 12) },
  { t: 'A.R. Rahman', kind: 'songs', f: () => searchSongs('ar rahman', 0, 12) },
  { t: 'Ilaiyaraaja Evergreen', kind: 'songs', f: () => searchSongs('ilaiyaraaja', 0, 12) },
  { t: 'Tamil Albums', kind: 'albums', f: () => searchAlbums('tamil') },
  { t: 'Yuvan Shankar Raja', kind: 'songs', f: () => searchSongs('yuvan shankar raja', 0, 12) },
  { t: 'Popular Tamil Artists', kind: 'artists', f: async () => {
    const results = await Promise.allSettled(['Anirudh Ravichander', 'A. R. Rahman', 'Ilaiyaraaja', 'Yuvan Shankar Raja', 'Sid Sriram', 'Harris Jayaraj', 'D. Imman', 'Santhosh Narayanan'].map((name) => searchArtists(name, 1)))
    const artists = results.flatMap((result) => result.status === 'fulfilled' ? result.value.slice(0, 1) : [])
    if (!artists.length && results.some((result) => result.status === 'rejected')) throw new Error('Could not load artists')
    return artists
  } },
]

function HomeSection({ config, priority }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(priority)
  const [items, setItems] = useState(undefined)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (visible || !ref.current) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { root: document.querySelector('.main'), rootMargin: '240px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    let active = true
    setItems(undefined)
    setError('')
    config.f().then((result) => {
      if (active) setItems(result)
    }).catch(() => {
      if (active) setError(`Could not load ${config.t.toLowerCase()}.`)
    })
    return () => { active = false }
  }, [config, visible, attempt])

  return (
    <div ref={ref} className="home-section">
      {error
        ? <section><h2>{config.t}</h2><div className="inline-notice" role="status">{error}
          <button type="button" className="retry-button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div></section>
        : <Section title={config.t} kind={config.kind} items={items} />}
    </div>
  )
}

function PersonalizedMix({ liked, recent }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const seeds = [...liked, ...recent].filter((song, index, list) => list.findIndex((item) => item.id === song.id) === index).slice(0, 3)
  const seedKey = seeds.map((song) => song.id).join('|')

  useEffect(() => {
    let active = true
    setItems([])
    setError('')
    if (!seeds.length) {
      setLoading(false)
      return () => { active = false }
    }
    setLoading(true)
    const queries = [...new Set(seeds.map((song) => song.artist?.split(',')[0].trim() || song.title).filter(Boolean))]
    Promise.allSettled(queries.map((query) => searchSongs(query, 0, 12))).then((results) => {
      if (!active) return
      const suggestions = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      const seedIds = new Set(seeds.map((song) => song.id))
      const mixed = dedupe(suggestions.filter((song) => !seedIds.has(song.id))).slice(0, 12)
      setItems(mixed)
      if (!mixed.length) {
        setError(results.every((result) => result.status === 'rejected')
          ? 'Could not build your mix right now.'
          : 'No recommendations found yet. Keep listening and check back.')
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [seedKey, attempt])

  if (!seeds.length) return <section className="personalized-empty">
    <h2>Your Mix</h2><p>Like or play a few songs to get recommendations picked for you.</p>
    <Link className="empty-action" to="/search">Discover music</Link>
  </section>
  return <section className="personalized-mix">
    <h2>Your Mix</h2>
    <p className="mix-subtitle">Based on your liked and recently played songs</p>
    {error
      ? <div className="inline-notice" role="status">{error}<button type="button" className="retry-button" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>
      : loading
        ? <p className="muted" role="status">Finding music for you…</p>
        : items.length ? <CardGrid kind="songs" items={items} />
          : <p className="muted">No recommendations found yet. Keep listening and check back.</p>}
  </section>
}

export default function Home() {
  const { recent, liked } = usePlayer()
  const h = new Date().getHours()
  return (
    <div className="page">
      <h1>{h < 12 ? 'காலை வணக்கம்' : h < 17 ? 'மதிய வணக்கம்' : h < 20 ? 'மாலை வணக்கம்' : 'இரவு வணக்கம்'}</h1>
      <p className="home-subtitle">A little music for your day</p>
      {recent.length > 0 && <Section title="Recently Played" kind="songs" items={recent.slice(0, 8)} />}
      <PersonalizedMix liked={liked} recent={recent} />
      {SECTIONS.map((config, index) => <HomeSection key={config.t} config={config} priority={index < 2} />)}
    </div>
  )
}
