import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getSong, getSuggestions, pickUrl, dedupe } from './api.js'

const Ctx = createContext()
export const usePlayer = () => useContext(Ctx)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const slim = (s) => ({ ...s, urls: [] }) // don't store expiring stream urls

export function PlayerProvider({ children }) {
  const audio = useRef(new Audio())
  const startId = useRef(0)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(() => load('volume', 0.8))
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')
  const [quality, setQuality] = useState(() => load('quality', '160kbps'))
  const [liked, setLiked] = useState(() => load('liked', []))
  const [recent, setRecent] = useState(() => load('recent', []))
  const [playlists, setPlaylists] = useState(() => load('playlists', []))
  const [sleepTimer, setSleepTimerState] = useState(null)
  const [error, setError] = useState('')
  const [buffering, setBuffering] = useState(false)
  const current = queue[index]
  const qualityRef = useRef(quality); qualityRef.current = quality
  const retried = useRef(false)
  const cur = useRef({}); cur.current = { queue, index }
  const sleepRef = useRef(sleepTimer); sleepRef.current = sleepTimer
  const clearError = () => setError('')

  useEffect(() => localStorage.setItem('liked', JSON.stringify(liked.map(slim))), [liked])
  useEffect(() => localStorage.setItem('recent', JSON.stringify(recent)), [recent])
  useEffect(() => localStorage.setItem('playlists', JSON.stringify(playlists.map((playlist) => ({ ...playlist, songs: playlist.songs.map(slim) })))), [playlists])
  useEffect(() => localStorage.setItem('quality', JSON.stringify(quality)), [quality])
  useEffect(() => { audio.current.volume = volume; localStorage.setItem('volume', volume) }, [volume])

  const setSleepTimer = useCallback((value) => {
    if (value === 'track') {
      setSleepTimerState({ type: 'track' })
    } else if (Number(value) > 0) {
      setSleepTimerState({ type: 'timer', minutes: Number(value), endsAt: Date.now() + Number(value) * 60000, remaining: Number(value) * 60 })
    } else {
      setSleepTimerState(null)
    }
  }, [])

  useEffect(() => {
    if (sleepTimer?.type !== 'timer') return
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((sleepTimer.endsAt - Date.now()) / 1000))
      setSleepTimerState((currentTimer) => {
        if (currentTimer?.type !== 'timer') return currentTimer
        if (!remaining) {
          audio.current.pause()
          return null
        }
        return currentTimer.remaining === remaining ? currentTimer : { ...currentTimer, remaining }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [sleepTimer?.type, sleepTimer?.endsAt])

  const start = useCallback(async (list, i, fresh = false, retrying = false) => {
    if (!list?.[i]) return
    const requestId = ++startId.current
    if (!retrying) retried.current = false
    setError(''); setBuffering(true)
    setTime(0); setDuration(0)
    let song = list[i]
    try {
      if (fresh || !song.urls?.length) { song = await getSong(song.id); list = list.map((s, k) => (k === i ? song : s)) }
      if (requestId !== startId.current) return
      const url = pickUrl(song.urls, qualityRef.current)
      if (!url) throw new Error('no stream URL')
      setQueue(list); setIndex(i)
      setRecent((r) => [slim(song), ...r.filter((x) => x.id !== song.id)].slice(0, 30))
      audio.current.src = url
      await audio.current.play()
    } catch (e) {
      if (requestId !== startId.current || e.name === 'AbortError') return
      setBuffering(false)
      setError(`Skipped "${song.title}" (${e.message})`)
      if (i + 1 < list.length) setTimeout(() => { if (requestId === startId.current) start(list, i + 1) }, 700)
      else setPlaying(false)
    }
  }, [])

  const playList = (list, i = 0) => list?.length && start(list, i)

  const next = useCallback(async () => {
    const { queue: q, index: i } = cur.current
    if (!q.length) return
    let n = shuffle && q.length > 1 ? (i + 1 + Math.floor(Math.random() * (q.length - 1))) % q.length : i + 1
    if (n < q.length) return start(q, n)
    if (repeat === 'all') return start(q, 0)
    // Autoplay: queue ended -> load similar (Tamil-first) songs
    try {
      const more = (await getSuggestions(q[i].id)).filter((s) => !q.some((x) => x.id === s.id))
      if (more.length) return start([...q, ...more], q.length)
    } catch {}
    setPlaying(false)
  }, [shuffle, repeat, start])

  const prev = useCallback(() => {
    if (audio.current.currentTime > 3 || index <= 0) audio.current.currentTime = 0
    else start(queue, index - 1)
  }, [index, queue, start])
  const toggle = () => {
    const a = audio.current
    if (!a.src) return
    if (a.paused) a.play().catch((e) => setError(`Could not resume playback (${e.message})`))
    else a.pause()
  }
  const seek = (t) => { audio.current.currentTime = t }
  const jump = (i) => start(queue, i)
  const addToQueue = (s) => setQueue((q) => dedupe([...q, s]))
  const playNext = useCallback((song) => {
    const { queue: q, index: i } = cur.current
    if (i < 0) return start([song, ...q], 0)
    setQueue((items) => [...items.slice(0, i + 1), song, ...items.slice(i + 1)])
  }, [start])
  const moveQueue = useCallback((from, to) => {
    const { queue: q } = cur.current
    if (to < 0 || to >= q.length || from < 0 || from >= q.length || from === to) return
    const reordered = [...q]
    const [song] = reordered.splice(from, 1)
    reordered.splice(to, 0, song)
    setQueue(reordered)
    setIndex((i) => i === from ? to : from < i && to >= i ? i - 1 : from > i && to <= i ? i + 1 : i)
  }, [])
  const removeFromQueue = useCallback((removeIndex) => {
    const { queue: q, index: i } = cur.current
    if (removeIndex < 0 || removeIndex >= q.length) return
    const remaining = q.filter((_, n) => n !== removeIndex)
    if (removeIndex === i) {
      if (!remaining.length) {
        startId.current++
        audio.current.pause()
        audio.current.removeAttribute('src')
        audio.current.load()
        setQueue([])
        setIndex(-1)
        setTime(0)
        setDuration(0)
        setBuffering(false)
      } else {
        start(remaining, Math.min(i, remaining.length - 1))
      }
    } else {
      setQueue(remaining)
      if (removeIndex < i) setIndex(i - 1)
    }
  }, [start])
  const toggleLike = (s) => setLiked((l) => (l.some((x) => x.id === s.id) ? l.filter((x) => x.id !== s.id) : [slim(s), ...l]))
  const isLiked = (id) => liked.some((x) => x.id === id)
  const createPlaylist = (title) => {
    const name = title.trim()
    if (!name) return
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setPlaylists((items) => [...items, { id, title: name, songs: [] }])
    return id
  }
  const renamePlaylist = (id, title) => {
    const name = title.trim()
    if (name) setPlaylists((items) => items.map((playlist) => playlist.id === id ? { ...playlist, title: name } : playlist))
  }
  const deletePlaylist = (id) => setPlaylists((items) => items.filter((playlist) => playlist.id !== id))
  const addSongToPlaylist = (id, song) => setPlaylists((items) => items.map((playlist) =>
    playlist.id === id && !playlist.songs.some((item) => item.id === song.id)
      ? { ...playlist, songs: [...playlist.songs, slim(song)] }
      : playlist))
  const removeSongFromPlaylist = (id, songId) => setPlaylists((items) => items.map((playlist) =>
    playlist.id === id ? { ...playlist, songs: playlist.songs.filter((song) => song.id !== songId) } : playlist))

  useEffect(() => {
    const a = audio.current
    const on = {
      play: () => setPlaying(true), pause: () => setPlaying(false),
      playing: () => setBuffering(false), waiting: () => setBuffering(true),
      timeupdate: () => setTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration),
      ended: () => {
        if (sleepRef.current?.type === 'track') {
          setSleepTimerState(null)
          a.pause()
          return
        }
        if (repeat === 'one') {
          a.currentTime = 0
          a.play().catch((e) => setError(`Could not repeat this track (${e.message})`))
        } else {
          next()
        }
      },
      error: () => { // 1st failure: refresh stream url from API. 2nd: skip.
        if (!a.src) return
        const { queue: q, index: i } = cur.current
        if (!q[i]) return
        if (!retried.current) { retried.current = true; start(q, i, true, true) } else { retried.current = false; next() }
      },
    }
    Object.entries(on).forEach(([e, f]) => a.addEventListener(e, f))
    return () => Object.entries(on).forEach(([e, f]) => a.removeEventListener(e, f))
  }, [next, repeat, start])

  useEffect(() => { // keyboard shortcuts
    const k = (e) => {
      if (e.target.isContentEditable || /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)) return
      if (e.code === 'Space') { e.preventDefault(); toggle() }
      if (e.shiftKey && e.code === 'ArrowRight') next()
      if (e.shiftKey && e.code === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (current && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album, artwork: [{ src: current.image, sizes: '512x512', type: 'image/jpeg' }] })
    }
    navigator.mediaSession.setActionHandler('play', () => {
      if (audio.current.paused) audio.current.play().catch((e) => setError(`Could not resume playback (${e.message})`))
    })
    navigator.mediaSession.setActionHandler('pause', () => audio.current.pause())
    navigator.mediaSession.setActionHandler('nexttrack', next)
    navigator.mediaSession.setActionHandler('previoustrack', prev)
  })

  return (
    <Ctx.Provider value={{ queue, index, current, playing, buffering, time, duration, volume, shuffle, repeat, quality, liked, recent, playlists, sleepTimer, error,
      playList, next, prev, toggle, seek, jump, addToQueue, playNext, moveQueue, removeFromQueue,
      createPlaylist, renamePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, setSleepTimer,
      setVolume, setShuffle, setRepeat, setQuality, toggleLike, isLiked, clearError }}>
      {children}
    </Ctx.Provider>
  )
}
