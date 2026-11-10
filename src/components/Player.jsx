import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import { fmt } from './SongRow.jsx'
import { getLyrics } from '../api.js'
import Icon from './Icon.jsx'
import ArtistNames from './ArtistNames.jsx'

export default function Player() {
  const p = usePlayer()
  const nav = useNavigate()
  const [queueOpen, setQueueOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [lyricsError, setLyricsError] = useState('')
  const [lyricsAttempt, setLyricsAttempt] = useState(0)
  const openButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const swipeStartRef = useRef(null)
  const ignoreSwipeClickRef = useRef(false)
  const c = p.current

  useEffect(() => {
    if (!expanded || !lyricsOpen || !c) return
    let active = true
    setLyrics('')
    setLyricsError('')
    if (c.hasLyrics === false) {
      setLyricsLoading(false)
      setLyricsError('Lyrics are not available from the current music source for this track.')
      return () => { active = false }
    }
    setLyricsLoading(true)
    getLyrics(c.id).then((text) => {
      if (active) setLyrics(text)
    }).catch(() => {
      if (active) setLyricsError('Lyrics are unavailable for this track.')
    }).finally(() => {
      if (active) setLyricsLoading(false)
    })
    return () => { active = false }
  }, [expanded, lyricsOpen, c?.id, lyricsAttempt])

  useEffect(() => {
    if (!expanded) return
    const overlay = document.querySelector('.now-playing-overlay')
    const focusable = () => [...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')]
    closeButtonRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpanded(false)
      } else if (e.key === 'Tab') {
        const items = focusable()
        if (!items.length) return
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault()
          items[items.length - 1].focus()
        } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
          e.preventDefault()
          items[0].focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      openButtonRef.current?.focus()
    }
  }, [expanded])

  const controls = (
    <div className="ctrl">
      <button type="button" className={p.shuffle ? 'on' : ''} aria-label="Toggle shuffle" aria-pressed={p.shuffle} onClick={() => p.setShuffle(!p.shuffle)}><Icon name="shuffle" /></button>
      <button type="button" aria-label="Previous track" onClick={p.prev}><Icon name="previous" /></button>
      <button type="button" className="play" aria-label={p.buffering ? 'Loading track' : p.playing ? 'Pause' : 'Play'}
        onClick={p.toggle} disabled={!c}><Icon name={p.buffering ? 'pause' : p.playing ? 'pause' : 'play'} /></button>
      <button type="button" aria-label="Next track" onClick={p.next}><Icon name="next" /></button>
      <button type="button" className={p.repeat !== 'off' ? 'on' : ''} aria-label={`Repeat ${p.repeat}`}
        aria-pressed={p.repeat !== 'off'} onClick={() => p.setRepeat({ off: 'all', all: 'one', one: 'off' }[p.repeat])}>
        <Icon name={p.repeat === 'one' ? 'repeatOne' : 'repeat'} />
      </button>
    </div>
  )
  const sleepValue = p.sleepTimer?.type === 'track' ? 'track'
    : p.sleepTimer?.type === 'timer' ? String(p.sleepTimer.minutes) : 'off'
  const handleTrackTouchStart = (event) => {
    if (event.touches.length !== 1) {
      swipeStartRef.current = null
      return
    }
    const touch = event.touches[0]
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }
  const handleTrackTouchEnd = (event) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.25) return
    ignoreSwipeClickRef.current = true
    setTimeout(() => { ignoreSwipeClickRef.current = false }, 800)
    if (dx < 0) p.next()
    else p.prev()
  }
  const handleTrackClick = (event) => {
    if (ignoreSwipeClickRef.current) {
      event.preventDefault()
      ignoreSwipeClickRef.current = false
      return
    }
    setExpanded(true)
  }

  const seek = (
    <div className="seek">
      <span>{fmt(p.time)}</span>
      <input type="range" min="0" max={p.duration || 0} step="0.1" value={p.time}
        aria-label="Playback position" aria-valuetext={`${fmt(p.time)} of ${fmt(p.duration)}`}
        onChange={(e) => p.seek(+e.target.value)}
        style={{ '--v': (p.time / (p.duration || 1)) * 100 + '%' }} />
      <span>{fmt(p.duration)}</span>
    </div>
  )

  const queue = queueOpen && (
    <div className={'queue' + (expanded ? ' expanded-queue' : '')} aria-label="Play queue">
      <div className="queue-heading"><h3>Queue</h3><span>{p.queue.length} tracks</span></div>
      {p.queue.map((s, i) => (
        <div key={s.id + i} className="qrow-wrap">
          <button type="button" className={'qrow' + (i === p.index ? ' on' : '')}
            aria-current={i === p.index ? 'true' : undefined} onClick={() => p.jump(i)}>
            <img src={s.image} alt="" /><span className="meta"><b>{s.title}</b><span>{s.artist}</span></span>
          </button>
          <div className="qrow-actions">
            <button type="button" aria-label={`Move ${s.title} up in queue`} disabled={i === 0} onClick={() => p.moveQueue(i, i - 1)}>↑</button>
            <button type="button" aria-label={`Move ${s.title} down in queue`} disabled={i === p.queue.length - 1} onClick={() => p.moveQueue(i, i + 1)}>↓</button>
            <button type="button" aria-label={`Remove ${s.title} from queue`} onClick={() => p.removeFromQueue(i)}>×</button>
          </div>
        </div>
      ))}
      {!p.queue.length && <p className="muted">Nothing queued yet. Add a song using ＋.</p>}
    </div>
  )

  return (
    <footer className="player" aria-label="Music player">
      {!expanded && queue}
      <div className="now">
        {c
          ? <>
            <button ref={openButtonRef} type="button" className="now-open" onClick={handleTrackClick}
              onTouchStart={handleTrackTouchStart} onTouchEnd={handleTrackTouchEnd} onTouchCancel={() => { swipeStartRef.current = null }}
              aria-label={`Open now playing: ${c.title} by ${c.artist}. Swipe left for next track or right for previous track.`}>
              <img src={c.image} alt="" />
              <span className="meta"><b>{c.title}</b><span>{c.artist}</span></span>
            </button>
            <button type="button" className={'heart' + (p.isLiked(c.id) ? ' on' : '')}
              aria-label={p.isLiked(c.id) ? `Unlike ${c.title}` : `Like ${c.title}`}
              aria-pressed={p.isLiked(c.id)} onClick={() => p.toggleLike(c)}><Icon name="heart" /></button>
          </>
          : <span className="player-hint">Choose a song to start listening</span>}
      </div>
      <div className="center">
        {controls}
        {seek}
      </div>
      <div className="vol">
        <label className="quality-control"><span className="sr-only">Audio quality</span>
          <select value={p.quality} onChange={(e) => p.setQuality(e.target.value)} title="Quality for next track">
            {['96kbps', '160kbps', '320kbps'].map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <button type="button" className={'queue-toggle' + (queueOpen ? ' on' : '')} onClick={() => setQueueOpen(!queueOpen)}
          aria-label={queueOpen ? 'Close queue' : 'Open queue'} aria-expanded={queueOpen}><Icon name="queue" /></button>
        <Icon name="volume" />
        <input type="range" min="0" max="1" step="0.01" value={p.volume} aria-label="Volume"
          onChange={(e) => p.setVolume(+e.target.value)} style={{ '--v': p.volume * 100 + '%' }} />
      </div>
      {expanded && (
        <div className="now-playing-overlay" role="dialog" aria-modal="true" aria-label="Now playing">
          <div className="now-playing-sheet">
            <header className="expanded-header">
              <button ref={closeButtonRef} type="button" className="icon-button" aria-label="Close now playing" onClick={() => setExpanded(false)}><Icon name="close" /></button>
              <div><small>NOW PLAYING</small><b>{c?.album || 'Musify'}</b></div>
              <div className="header-actions">
                <button type="button" className={'text-button' + (lyricsOpen ? ' on' : '')} aria-pressed={lyricsOpen}
                  onClick={() => setLyricsOpen((open) => !open)}>Lyrics</button>
                <button type="button" className={'icon-button' + (queueOpen ? ' on' : '')} aria-label={queueOpen ? 'Hide queue' : 'Show queue'}
                  aria-expanded={queueOpen} onClick={() => setQueueOpen(!queueOpen)}><Icon name="queue" /></button>
              </div>
            </header>
            {c && (
              <>
                <img className="expanded-art" src={c.image} alt="" />
                <div className="expanded-track">
                  <div className="meta"><b>{c.title}</b>
                    <ArtistNames artists={c.artistLinks} fallback={c.artist} onNavigate={() => setExpanded(false)} />
                  </div>
                  <button type="button" className={'heart' + (p.isLiked(c.id) ? ' on' : '')}
                    aria-label={p.isLiked(c.id) ? `Unlike ${c.title}` : `Like ${c.title}`}
                    aria-pressed={p.isLiked(c.id)} onClick={() => p.toggleLike(c)}><Icon name="heart" /></button>
                </div>
                {lyricsOpen && <section className="lyrics-panel" aria-label="Lyrics">
                  <h2>Lyrics</h2>
                  {lyricsLoading && <p className="muted" role="status">Loading lyrics…</p>}
                  {lyricsError && <div className="inline-notice" role="status"><span>{lyricsError}</span>
                    {c.hasLyrics !== false && <button type="button" className="retry-button" onClick={() => setLyricsAttempt((attempt) => attempt + 1)}>Try again</button>}
                  </div>}
                  {lyrics && <p className="lyrics-text">{lyrics}</p>}
                </section>}
                {seek}
                {controls}
                <div className="expanded-settings">
                  <label><Icon name="volume" /><span>Volume</span>
                    <input type="range" min="0" max="1" step="0.01" value={p.volume} aria-label="Volume"
                      onChange={(e) => p.setVolume(+e.target.value)} style={{ '--v': p.volume * 100 + '%' }} />
                  </label>
                  <label><span>Audio quality</span>
                    <select value={p.quality} onChange={(e) => p.setQuality(e.target.value)}>
                      {['96kbps', '160kbps', '320kbps'].map((q) => <option key={q}>{q}</option>)}
                    </select>
                  </label>
                  <label><span>Sleep timer</span>
                    <select value={sleepValue} onChange={(event) => p.setSleepTimer(event.target.value)}>
                      <option value="off">Off</option>
                      <option value="track">At end of track</option>
                      {[5, 10, 15, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                    </select>
                    {p.sleepTimer?.type === 'timer' && <small className="timer-remaining">{fmt(p.sleepTimer.remaining)} left</small>}
                  </label>
                </div>
                {queue}
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}
