
import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import '../styles/before-after.css'

export default function BeforeAfterSlider({
  title = 'Cleaning transformation',
  before,
  after,
}) {
  const [position, setPosition] = useState(50)
  const [beforeFailed, setBeforeFailed] = useState(false)
  const [afterFailed, setAfterFailed] = useState(false)

  const bothLoaded = !beforeFailed && !afterFailed
  const noneLoaded = beforeFailed && afterFailed

  return (
    <div className="ba-slider">
      {!afterFailed && (
        <img
          className="ba-image ba-image-after"
          src={after}
          alt={`${title} after cleaning`}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setAfterFailed(true)}
        />
      )}

      {!beforeFailed && (
        <img
          className="ba-image ba-image-before"
          src={before}
          alt={`${title} before cleaning`}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setBeforeFailed(true)}
          style={
            bothLoaded
              ? {
                  clipPath: `inset(0 ${100 - position}% 0 0)`,
                }
              : undefined
          }
        />
      )}

      {bothLoaded && (
        <>
          <span className="ba-label ba-label-before">Before</span>
          <span className="ba-label ba-label-after">After</span>

          <span
            className="ba-divider"
            style={{ left: `${position}%` }}
          />

          <span
            className="ba-handle"
            style={{ left: `${position}%` }}
          >
            <ArrowLeftRight size={18} aria-hidden="true" />
          </span>

          <input
            className="ba-range"
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={position}
            onChange={(event) =>
              setPosition(Number(event.target.value))
            }
            aria-label={`Compare before and after: ${title}`}
          />
        </>
      )}

      {!bothLoaded && !noneLoaded && (
        <>
          <span
            className={
              beforeFailed
                ? 'ba-label ba-label-after'
                : 'ba-label ba-label-before'
            }
          >
            {beforeFailed ? 'After' : 'Before'}
          </span>

          <span className="ba-note">
            {beforeFailed ? 'Before' : 'After'} photo coming soon
          </span>
        </>
      )}

      {noneLoaded && (
        <span className="ba-missing">
          Photos coming soon
        </span>
      )}
    </div>
  )
}
