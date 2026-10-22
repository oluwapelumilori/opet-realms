import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import '../styles/before-after.css'

export default function BeforeAfterSlider({
  title = 'Cleaning transformation',
  before,
  after,
}) {
  const [position, setPosition] = useState(50)

  return (
    <div className="ba-slider">
      <img
        className="ba-image"
        src={after}
        alt={`${title} after cleaning`}
        loading="lazy"
        decoding="async"
        draggable="false"
      />

      <img
        className="ba-image ba-image-before"
        src={before}
        alt={`${title} before cleaning`}
        loading="lazy"
        decoding="async"
        draggable="false"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <span className="ba-label ba-label-before">Before</span>
      <span className="ba-label ba-label-after">After</span>

      <span className="ba-divider" style={{ left: `${position}%` }} />

      <span className="ba-handle" style={{ left: `${position}%` }}>
        <ArrowLeftRight size={18} aria-hidden="true" />
      </span>

      <input
        className="ba-range"
        type="range"
        min="0"
        max="100"
        step="0.5"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Compare before and after: ${title}`}
      />
    </div>
  )
}
