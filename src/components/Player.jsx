import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import { fmt } from './SongRow.jsx'
export default function Player() {
  const p = usePlayer()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const c = p.current
  return (
    <footer className="player">
      {open && <div className="queue"><h3>Queue</h3>
        {p.queue.map((s, i) => <div key={s.id + i} className={'qrow' + (i === p.index ? ' on' : '')} onClick={() => p.jump(i)}>
          <img src={s.image} alt="" /><div className="meta"><b>{s.title}</b><span>{s.artist}</span></div></div>)}
        {!p.queue.length && <p className="muted">Nothing queued</p>}</div>}
      <div className="now">
        {c && <><img src={c.image} alt="" /><div className="meta"><b>{c.title}</b>
          <span className={c.artistId ? 'link' : ''} onClick={() => c.artistId && nav('/artist/' + c.artistId)}>{c.artist}</span></div>
          <button className={'heart' + (p.isLiked(c.id) ? ' on' : '')} onClick={() => p.toggleLike(c)}>♥</button></>}
      </div>
      <div className="center">
        <div className="ctrl">
          <button className={p.shuffle ? 'on' : ''} onClick={() => p.setShuffle(!p.shuffle)}>🔀</button>
          <button onClick={p.prev}>⏮</button>
          <button className="play" onClick={p.toggle}>{p.buffering ? '…' : p.playing ? '⏸' : '▶'}</button>
          <button onClick={p.next}>⏭</button>
          <button className={p.repeat !== 'off' ? 'on' : ''} onClick={() => p.setRepeat({ off: 'all', all: 'one', one: 'off' }[p.repeat])}>{p.repeat === 'one' ? '🔂' : '🔁'}</button>
        </div>
        <div className="seek">
          <span>{fmt(p.time)}</span>
          <input type="range" min="0" max={p.duration || 0} step="0.1" value={p.time} onChange={(e) => p.seek(+e.target.value)} style={{ '--v': (p.time / (p.duration || 1)) * 100 + '%' }} />
          <span>{fmt(p.duration)}</span>
        </div>
      </div>
      <div className="vol">
        <select value={p.quality} onChange={(e) => p.setQuality(e.target.value)} title="Next-song quality">
          {['96kbps', '160kbps', '320kbps'].map((q) => <option key={q}>{q}</option>)}</select>
        <button className={open ? 'on' : ''} onClick={() => setOpen(!open)}>☰</button>
        🔊 <input type="range" min="0" max="1" step="0.01" value={p.volume} onChange={(e) => p.setVolume(+e.target.value)} style={{ '--v': p.volume * 100 + '%' }} />
      </div>
    </footer>
  )
}
