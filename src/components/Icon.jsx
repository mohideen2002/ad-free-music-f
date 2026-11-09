const paths = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  library: <><path d="M4 4v16M9 4v16M14 5l4-1 3 15-4 1z" /></>,
  shuffle: <><path d="m16 3 5 4-5 4" /><path d="M4 7h3c5 0 5 10 10 10h4" /><path d="m16 13 5 4-5 4" /><path d="M4 17h3c1.7 0 2.8-1.6 3.8-3.5M14.2 10.5C15 8.7 16 7 18 7h3" /></>,
  previous: <><path d="M5 5v14" /><path d="m19 5-10 7 10 7z" /></>,
  next: <><path d="M19 5v14" /><path d="m5 5 10 7-10 7z" /></>,
  play: <path d="m7 4 14 8-14 8z" />,
  pause: <><path d="M7 5h4v14H7z" /><path d="M15 5h4v14h-4z" /></>,
  repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
  repeatOne: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3M12 9v6m-1-5 1-1 1 1" /></>,
  heart: <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
  queue: <><path d="M4 6h16M4 12h16M4 18h10" /><path d="m17 15 4 3-4 3z" /></>,
  close: <><path d="m5 5 14 14M19 5 5 19" /></>,
  volume: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11" /></>,
}

export default function Icon({ name, size = 20 }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}
