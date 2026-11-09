export default function Card({ image, title, sub, onClick, round }) {
  return (
    <button type="button" className="card" onClick={onClick} aria-label={`${title}${sub ? `, ${sub}` : ''}`}>
      <img src={image} alt="" className={round ? 'round' : ''} />
      <b>{title}</b><span>{sub}</span>
    </button>
  )
}
