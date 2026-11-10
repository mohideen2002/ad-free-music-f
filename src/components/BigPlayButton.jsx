import { usePlayer } from '../PlayerContext.jsx'
import Icon from './Icon.jsx'

export default function BigPlayButton({ list, label }) {
  const { queue, playing, toggle, playList } = usePlayer()
  const sameQueue = list.length === queue.length && list.every((song, i) => song.id === queue[i]?.id)
  const isPlaying = sameQueue && playing
  const action = isPlaying ? 'Pause' : 'Play'

  return (
    <button type="button" className="bigplay" aria-label={`${action} ${label}`} disabled={!list.length}
      onClick={() => sameQueue ? toggle() : playList(list, 0)}>
      <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
    </button>
  )
}
