import { useEffect, useState } from 'react'
import { searchSongs, searchAlbums, searchPlaylists, searchArtists } from '../api.js'
import { usePlayer } from '../PlayerContext.jsx'
import Section from '../components/Section.jsx'

const SECTIONS = [
  { t: 'Tamil Trending', kind: 'songs', f: () => searchSongs('trending', 0, 12) },
  { t: 'Latest Tamil Hits', kind: 'songs', f: () => searchSongs('latest hits', 0, 12) },
  { t: 'Tamil Playlists', kind: 'playlists', f: () => searchPlaylists('tamil hits') },
  { t: 'Anirudh Ravichander', kind: 'songs', f: () => searchSongs('anirudh', 0, 12) },
  { t: 'A.R. Rahman', kind: 'songs', f: () => searchSongs('ar rahman', 0, 12) },
  { t: 'Ilaiyaraaja Evergreen', kind: 'songs', f: () => searchSongs('ilaiyaraaja', 0, 12) },
  { t: 'Tamil Albums', kind: 'albums', f: () => searchAlbums('tamil') },
  { t: 'Yuvan Shankar Raja', kind: 'songs', f: () => searchSongs('yuvan shankar raja', 0, 12) },
  { t: 'Popular Tamil Artists', kind: 'artists', f: async () => (await Promise.all(['Anirudh Ravichander', 'A. R. Rahman', 'Ilaiyaraaja', 'Yuvan Shankar Raja', 'Sid Sriram', 'Harris Jayaraj', 'D. Imman', 'Santhosh Narayanan'].map((n) => searchArtists(n, 1).then((r) => r[0]).catch(() => null)))).filter(Boolean) },
]
export default function Home() {
  const [data, setData] = useState({})
  const { recent } = usePlayer()
  useEffect(() => {
    SECTIONS.forEach((s) => s.f().then((r) => setData((d) => ({ ...d, [s.t]: r }))).catch(() => setData((d) => ({ ...d, [s.t]: [] }))))
  }, [])
  const h = new Date().getHours()
  return (
    <div className="page">
      <h1>{h < 12 ? 'காலை வணக்கம் ☀️' : h < 18 ? 'மதிய வணக்கம் 🌤️' : 'மாலை வணக்கம் 🌙'}</h1>
      {recent.length > 0 && <Section title="Recently Played" kind="songs" items={recent.slice(0, 8)} />}
      {SECTIONS.map((s) => <Section key={s.t} title={s.t} kind={s.kind} items={data[s.t]} />)}
    </div>
  )
}
