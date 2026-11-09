export default function Card({ image, title, sub, onClick, round }) {
  return (
    <div className="card" onClick={onClick}>
      <img src={image} alt="" className={round ? 'round' : ''} />
      <b>{title}</b><span>{sub}</span>
    </div>
  )
}
