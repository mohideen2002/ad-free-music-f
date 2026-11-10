import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import SongRow from '../components/SongRow.jsx'
import BigPlayButton from '../components/BigPlayButton.jsx'

export default function Library() {
  const { liked, recent, playlists, createPlaylist, renamePlaylist, deletePlaylist } = usePlayer()
  const [tab, setTab] = useState('Liked')
  const [selectedId, setSelectedId] = useState('')
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState('')
  const selected = playlists.find((playlist) => playlist.id === selectedId)
  const list = tab === 'Liked' ? liked : recent

  const submitCreate = (event) => {
    event.preventDefault()
    const id = createPlaylist(title)
    if (id) {
      setSelectedId(id)
      setTab('Playlists')
      setTitle('')
      setCreating(false)
    }
  }
  const submitRename = (event) => {
    event.preventDefault()
    if (!selected) return
    renamePlaylist(selected.id, title)
    setTitle('')
    setRenaming(false)
  }
  const removePlaylist = () => {
    if (!selected || !window.confirm(`Delete "${selected.title}"?`)) return
    deletePlaylist(selected.id)
    setSelectedId('')
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="cover">{tab === 'Liked' ? '♥' : tab === 'Recent' ? '◷' : '♫'}</div>
        <div><small>YOUR LIBRARY</small><h1>{selected?.title || (tab === 'Liked' ? 'Liked Songs' : tab === 'Recent' ? 'Recently Played' : 'Your Playlists')}</h1>
          <span>{selected ? `${selected.songs.length} songs` : tab === 'Liked' ? `${liked.length} songs` : tab === 'Recent' ? `${recent.length} songs` : `${playlists.length} playlists`}</span>
        </div>
      </div>
      <div className="chips" role="tablist" aria-label="Library sections">
        {['Liked', 'Recent', 'Playlists'].map((item) =>
          <button type="button" role="tab" aria-selected={tab === item} key={item} className={tab === item ? 'on' : ''}
            onClick={() => { setTab(item); setSelectedId(''); setRenaming(false) }}>{item}</button>)}
      </div>

      {tab !== 'Playlists' && <>
        {list.length > 0 && <BigPlayButton list={list} label={tab === 'Liked' ? 'liked songs' : 'recently played songs'} />}
        {list.map((song, i) => <SongRow key={song.id} song={song} list={list} i={i} />)}
        {!list.length && <div className="empty-state"><b>{tab === 'Liked' ? 'Your liked songs will show up here' : 'Your listening history is empty'}</b>
          <span>{tab === 'Liked' ? 'Tap the heart on any track to save it to your library.' : 'Play a song and it will appear here.'}</span>
          <Link className="empty-action" to={tab === 'Liked' ? '/search' : '/'}>{tab === 'Liked' ? 'Find something to play' : 'Explore music'}</Link>
        </div>}
      </>}

      {tab === 'Playlists' && <>
        <div className="playlist-toolbar">
          <button type="button" className="empty-action" onClick={() => { setCreating((value) => !value); setTitle('') }}>
            {creating ? 'Cancel' : '＋ Create playlist'}
          </button>
        </div>
        {creating && <form className="playlist-form" onSubmit={submitCreate}>
          <label htmlFor="new-playlist-title">Playlist name</label>
          <input id="new-playlist-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="80" required autoFocus />
          <button type="submit" className="empty-action">Create</button>
        </form>}
        {playlists.length > 0 && !selected && <div className="playlist-list">
          {playlists.map((playlist) => <button type="button" key={playlist.id} className="playlist-list-item"
            onClick={() => setSelectedId(playlist.id)}>
            <span className="playlist-list-icon">♫</span>
            <span><b>{playlist.title}</b><small>{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</small></span>
          </button>)}
        </div>}
        {selected && <>
          <div className="playlist-actions">
            <button type="button" className="text-button" onClick={() => { setRenaming((value) => !value); setTitle(selected.title) }}>
              {renaming ? 'Cancel rename' : 'Rename'}
            </button>
            <button type="button" className="text-button danger-button" onClick={removePlaylist}>Delete playlist</button>
            <button type="button" className="text-button" onClick={() => setSelectedId('')}>All playlists</button>
          </div>
          {renaming && <form className="playlist-form" onSubmit={submitRename}>
            <label htmlFor="rename-playlist-title">New playlist name</label>
            <input id="rename-playlist-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="80" required autoFocus />
            <button type="submit" className="empty-action">Save</button>
          </form>}
          {selected.songs.length > 0
            ? <>
              <BigPlayButton list={selected.songs} label={selected.title} />
              {selected.songs.map((song, i) => <SongRow key={song.id} song={song} list={selected.songs} i={i} playlistId={selected.id} />)}
            </>
            : <div className="empty-state"><b>This playlist is empty</b><span>Add songs using the ⋯ menu on any track.</span><Link className="empty-action" to="/search">Find songs</Link></div>}
        </>}
        {!playlists.length && !creating && <div className="empty-state"><b>No playlists yet</b><span>Create a playlist and add songs from search or your library.</span></div>}
      </>}
    </div>
  )
}
