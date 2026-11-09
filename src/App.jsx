import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Player from './components/Player.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Library from './pages/Library.jsx'
import Collection from './pages/Collection.jsx'
import Artist from './pages/Artist.jsx'
import { usePlayer } from './PlayerContext.jsx'

export default function App() {
  const { error } = usePlayer()
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        {error && <div className="toast">{error}</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/album/:id" element={<Collection type="album" />} />
          <Route path="/playlist/:id" element={<Collection type="playlist" />} />
          <Route path="/artist/:id" element={<Artist />} />
        </Routes>
      </main>
      <Player />
    </div>
  )
}
