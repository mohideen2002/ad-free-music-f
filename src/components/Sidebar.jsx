import { NavLink } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
export default function Sidebar() {
  const { liked } = usePlayer()
  return (
    <aside className="sidebar">
      <div className="logo">🎧 Musify</div>
      <nav>
        <NavLink to="/" end>🏠 Home</NavLink>
        <NavLink to="/search">🔍 Search</NavLink>
        <NavLink to="/library">📚 Liked Songs <small>({liked.length})</small></NavLink>
      </nav>
    </aside>
  )
}
