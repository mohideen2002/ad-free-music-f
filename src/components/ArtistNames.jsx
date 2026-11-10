import { useNavigate } from 'react-router-dom'

export default function ArtistNames({ artists, fallback, onNavigate }) {
  const nav = useNavigate()
  const names = artists?.length ? artists : (fallback || '').split(',').map((name) => ({ name: name.trim() })).filter((artist) => artist.name)
  if (!names.length) return null

  return (
    <span className="artist-names">
      {names.map((artist, i) => (
        <span key={`${artist.id || artist.name}-${i}`}>
          {i > 0 && ', '}
          {artist.id
            ? <button type="button" className="artist-link" onClick={() => { onNavigate?.(); nav('/artist/' + encodeURIComponent(artist.id)) }}>{artist.name}</button>
            : artist.name}
        </span>
      ))}
    </span>
  )
}
