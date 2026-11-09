import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import SongRow from '../components/SongRow.jsx'
export default function Library() {
  const { liked, recent, playList } = usePlayer()
  const [tab, setTab] = useState('Liked')
  const list = tab === 'Liked' ? liked : recent
  return (
    <div className="page">
      <div className="hero"><div className="cover">{tab === 'Liked' ? '♥' : '🕘'}</div><div><small>PLAYLIST</small><h1>{tab === 'Liked' ? 'Liked Songs' : 'Recently Played'}</h1><span>{list.length} songs</span></div></div>
      <div className="chips">{['Liked', 'Recent'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {list.length > 0 && <button className="bigplay" onClick={() => playList(list, 0)}>▶</button>}
      {list.map((s, i) => <SongRow key={s.id} song={s} list={list} i={i} />)}
      {!list.length && <div className="empty-state"><b>{tab === 'Liked' ? 'Your liked songs will show up here' : 'Your listening history is empty'}</b>
        <span>{tab === 'Liked' ? 'Tap the heart on any track to save it to your library.' : 'Play a song and it will appear here.'}</span>
        <Link className="empty-action" to={tab === 'Liked' ? '/search' : '/'}>{tab === 'Liked' ? 'Find something to play' : 'Explore music'}</Link>
      </div>}
    </div>
  )
}
