// ---------- Core fetch: timeout + retry + cache ----------
const BASE = '/api'
const cache = new Map()
export const clean = (s) => (s || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
async function get(u, ttl = 600000) {
  const c = cache.get(u)
  if (c && Date.now() - c.t < ttl) return c.d
  let err
  for (let i = 0; i < 3; i++) {
    const ctl = new AbortController()
    const to = setTimeout(() => ctl.abort(), 10000)
    try {
      const r = await fetch(BASE + u, { signal: ctl.signal })
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const j = await r.json()
      if (j.success === false) throw new Error(j.message || 'API failed')
      cache.set(u, { t: Date.now(), d: j.data })
      return j.data
    } catch (e) { err = e; await new Promise((r) => setTimeout(r, 400 * (i + 1))) }
    finally { clearTimeout(to) }
  }
  throw err
}
const q = encodeURIComponent
const img = (a) => (a || []).at(-1)?.url || ''

// ---------- Normalizers ----------
export const normSong = (s) => {
  const primaryArtists = s.artists?.primary || []
  const artist = clean(primaryArtists.map((a) => a.name).join(', ') || s.primaryArtists || s.singers || '')
  return {
    id: s.id,
    title: clean(s.name || s.title),
    artist,
    artistLinks: primaryArtists.map((a) => ({ id: a.id, name: clean(a.name) })),
    album: clean(typeof s.album === 'string' ? s.album : s.album?.name),
    image: img(s.image),
    duration: Number(s.duration) || 0,
    language: (s.language || '').toLowerCase(),
    hasLyrics: s.hasLyrics,
    lyricsId: s.lyricsId,
    urls: s.downloadUrl || [],
  }
}
const normAlbum = (a) => ({ id: a.id, title: clean(a.name || a.title), sub: clean(a.artists?.primary?.map((x) => x.name).join(', ') || a.artist || a.year || ''), image: img(a.image), language: (a.language || '').toLowerCase() })
const normPlaylist = (p) => ({ id: p.id, title: clean(p.name || p.title), sub: p.songCount ? `${p.songCount} songs` : 'Playlist', image: img(p.image), language: (p.language || '').toLowerCase() })
const normArtist = (a) => ({ id: a.id, title: clean(a.name || a.title), sub: 'Artist', image: img(a.image) })

// ---------- Tamil-first logic ----------
export const isTamil = (x) => x.language === 'tamil'
const tamilFirstOrder = (list) => [...list.filter(isTamil), ...list.filter((item) => !isTamil(item))]
const dedupeById = (list) => {
  const seen = new Set()
  return list.filter((item) => {
    if (item.id == null || item.id === '') return true
    const id = String(item.id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}
export const dedupe = (list) => {
  const seen = new Set()
  return list.filter((s) => { const k = (s.title + '|' + (s.artist || s.sub || '')).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
}
// 1) try "<query> tamil"  2) try plain query  -> keep only Tamil if any exists; else fall back to other languages
async function tamilFirst(fetchFn, query) {
  let firstResults = []
  try {
    firstResults = await fetchFn(query + ' tamil')
    const tamil = firstResults.filter(isTamil)
    if (tamil.length) return dedupe(tamil)
  } catch {}
  try {
    const r = await fetchFn(query)
    const tamil = r.filter(isTamil)
    return dedupe(tamil.length ? tamil : r.length ? r : firstResults)
  } catch (e) {
    if (firstResults.length) return dedupe(firstResults)
    throw e
  }
}
export const pickUrl = (urls = [], pref = '160kbps') => {
  const order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']
  const want = order.indexOf(pref)
  for (let i = want; i < order.length; i++) { const u = urls.find((x) => x.quality === order[i]); if (u) return u.url }
  return urls.at(-1)?.url
}

// ---------- Search ----------
export const searchSongs = (query, page = 0, limit = 20) =>
  tamilFirst(async (qq) => (await get(`/search/songs?query=${q(qq)}&page=${page}&limit=${limit}`, 120000)).results.map(normSong), query)
export const searchAlbums = (query, limit = 12) =>
  tamilFirst(async (qq) => (await get(`/search/albums?query=${q(qq)}&page=0&limit=${limit}`)).results.map(normAlbum), query)
export const searchPlaylists = (query, limit = 12) =>
  tamilFirst(async (qq) => (await get(`/search/playlists?query=${q(qq)}&page=0&limit=${limit}`)).results.map(normPlaylist), query)
export const searchArtists = async (query, limit = 12) =>
  dedupe((await get(`/search/artists?query=${q(query)}&page=0&limit=${limit}`)).results.map(normArtist))

// ---------- Details ----------
export const getSong = async (id) => { const d = await get(`/songs/${id}`, 300000); return normSong(Array.isArray(d) ? d[0] : d) }
export const getLyrics = async (id) => {
  const data = await get(`/songs/${id}/lyrics`, 3600000)
  const raw = typeof data === 'string' ? data : typeof data?.lyrics === 'string' ? data.lyrics : typeof data?.text === 'string' ? data.text : ''
  const lyrics = clean(raw.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '')).trim()
  if (!lyrics) throw new Error('Lyrics are unavailable for this track')
  return lyrics
}
export const getSuggestions = async (id) => {
  const d = await get(`/songs/${id}/suggestions?limit=20`, 300000)
  const list = (Array.isArray(d) ? d : d.songs || []).map(normSong)
  const t = list.filter(isTamil)
  return dedupe(t.length ? t : list)
}
export const getAlbum = async (id) => { const d = await get(`/albums?id=${id}`); return { title: clean(d.name), image: img(d.image), sub: clean(d.artists?.primary?.map((x) => x.name).join(', ') || ''), songs: dedupe((d.songs || []).map(normSong)) } }
export const getPlaylist = async (id) => { const d = await get(`/playlists?id=${id}&limit=100`); return { title: clean(d.name), image: img(d.image), sub: clean(d.description || ''), songs: dedupe((d.songs || []).map(normSong)) } }
export const getArtist = async (id) => {
  const d = await get(`/artists/${id}`)
  let songs = (d.topSongs || []).map(normSong)
  if (!songs.length) songs = ((await get(`/artists/${id}/songs?page=0`)).songs || []).map(normSong)
  let albums = (d.topAlbums || []).map(normAlbum)
  if (!albums.length) albums = ((await get(`/artists/${id}/albums?page=0`)).albums || []).map(normAlbum)
  const bio = Array.isArray(d.bio)
    ? d.bio.map((item) => clean(typeof item === 'string' ? item : item?.text || item?.title || '')).filter(Boolean)
    : typeof d.bio === 'string' && clean(d.bio) ? [clean(d.bio)] : []
  return {
    name: clean(d.name),
    image: img(d.image),
    followers: d.followerCount,
    fans: d.fanCount,
    verified: d.isVerified,
    dob: clean(d.dob),
    dominantLanguage: clean(d.dominantLanguage),
    dominantType: clean(d.dominantType),
    radioAvailable: d.isRadioPresent,
    availableLanguages: d.availableLanguages || [],
    bio,
    links: [
      { label: 'JioSaavn profile', url: d.url },
      { label: 'Wikipedia', url: d.wiki },
      { label: 'Facebook', url: d.fb },
      { label: 'Twitter', url: d.twitter },
    ].filter((link) => typeof link.url === 'string' && /^https?:\/\//i.test(link.url)),
    songs: tamilFirstOrder(dedupeById(songs)),
    albums: tamilFirstOrder(dedupeById(albums)),
    singles: tamilFirstOrder(dedupeById((d.singles || []).map(normAlbum))),
    similarArtists: (d.similarArtists || []).map(normArtist),
  }
}
