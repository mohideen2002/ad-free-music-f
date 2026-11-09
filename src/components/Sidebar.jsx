import { NavLink } from 'react-router-dom'
import { usePlayer } from '../PlayerContext.jsx'
import Icon from './Icon.jsx'
export default function Sidebar() {
  const { liked } = usePlayer()
  return (
    <aside className="sidebar">
      <div className="logo"><span className="logo-mark">M</span> Musify</div>
      <nav>
        <NavLink to="/" end><Icon name="home" /><span>Home</span></NavLink>
        <NavLink to="/search"><Icon name="search" /><span>Search</span></NavLink>
        <NavLink to="/library"><Icon name="library" /><span>Your Library</span><small>{liked.length}</small></NavLink>
      </nav>
    </aside>
  )
}
