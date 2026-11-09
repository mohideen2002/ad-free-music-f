import { useNavigate } from 'react-router-dom'
import Card from './Card.jsx'
import { usePlayer } from '../PlayerContext.jsx'
// kind: songs | albums | playlists | artists
export function CardGrid({ kind, items }) {
  const nav = useNavigate(); const { playList } = usePlayer()
  const go = (x, i) => kind === 'songs' ? playList(items, i) : nav(`/${kind.slice(0, -1)}/${x.id}`)
  return <div className="grid">{items.map((x, i) =>
    <Card key={x.id + i} round={kind === 'artists'} image={x.image} title={x.title} sub={kind === 'songs' ? x.artist : x.sub} onClick={() => go(x, i)} />)}</div>
}
export default function Section({ title, kind, items }) {
  if (items === undefined) return <section><h2>{title}</h2><div className="grid">{Array(6).fill(0).map((_, i) => <div key={i} className="card skeleton" />)}</div></section>
  if (!items.length) return null
  return <section><h2>{title}</h2><CardGrid kind={kind} items={items} /></section>
}
