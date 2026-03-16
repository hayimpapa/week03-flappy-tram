import React from 'react'
import { GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, COLORS } from '../constants.js'

const MELBOURNE_IMG = 'https://raw.githubusercontent.com/hayimpapa/week03-flappy-tram/main/public/melbourne.png'

// The banner image is wide (~2400px) and short (~400px tall).
// We tile it horizontally and position it to fill the sky area above the ground.
const IMG_WIDTH = 2400
const IMG_DISPLAY_HEIGHT = GAME_HEIGHT - GROUND_HEIGHT

export default function Background({ scrollX }) {
  const layer4Speed = 1.0
  const groundOffset = -(scrollX * layer4Speed) % 40

  // Scroll the image at a moderate parallax speed
  const imgScrollSpeed = 0.3
  const imgOffset = -(scrollX * imgScrollSpeed) % IMG_WIDTH

  return (
    <g>
      {/* Sky fill behind the image (in case of gaps) */}
      <rect x="0" y="0" width={GAME_WIDTH} height={GAME_HEIGHT} fill="#87CEEB" />

      {/* Melbourne banner image - tiled horizontally */}
      <clipPath id="skyClip">
        <rect x="0" y="0" width={GAME_WIDTH} height={IMG_DISPLAY_HEIGHT} />
      </clipPath>
      <g clipPath="url(#skyClip)">
        <image
          href={MELBOURNE_IMG}
          x={imgOffset}
          y="0"
          width={IMG_WIDTH}
          height={IMG_DISPLAY_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
        />
        <image
          href={MELBOURNE_IMG}
          x={imgOffset + IMG_WIDTH}
          y="0"
          width={IMG_WIDTH}
          height={IMG_DISPLAY_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      {/* Layer 4: Ground - tram tracks */}
      <rect
        x="0" y={GAME_HEIGHT - GROUND_HEIGHT}
        width={GAME_WIDTH} height={GROUND_HEIGHT}
        fill={COLORS.ground}
      />
      {/* Track lines */}
      <g transform={`translate(${groundOffset}, 0)`}>
        {Array.from({ length: Math.ceil(GAME_WIDTH / 40) + 2 }, (_, i) => (
          <g key={i}>
            <rect
              x={i * 40} y={GAME_HEIGHT - GROUND_HEIGHT + 10}
              width="35" height="3" fill={COLORS.groundLine} rx="1"
            />
            <rect
              x={i * 40} y={GAME_HEIGHT - GROUND_HEIGHT + 25}
              width="35" height="3" fill={COLORS.groundLine} rx="1"
            />
          </g>
        ))}
      </g>
      {/* Rail lines */}
      <line
        x1="0" y1={GAME_HEIGHT - GROUND_HEIGHT + 15}
        x2={GAME_WIDTH} y2={GAME_HEIGHT - GROUND_HEIGHT + 15}
        stroke="#a09080" strokeWidth="2"
      />
      <line
        x1="0" y1={GAME_HEIGHT - GROUND_HEIGHT + 30}
        x2={GAME_WIDTH} y2={GAME_HEIGHT - GROUND_HEIGHT + 30}
        stroke="#a09080" strokeWidth="2"
      />
      {/* Cobblestone pattern */}
      <g opacity="0.3">
        {Array.from({ length: 15 }, (_, i) => (
          <g key={i}>
            <rect
              x={((i * 28 + groundOffset) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH}
              y={GAME_HEIGHT - GROUND_HEIGHT + 38}
              width="20" height="8" fill="#b8a888" rx="2"
            />
            <rect
              x={((i * 28 + 14 + groundOffset) % GAME_WIDTH + GAME_WIDTH) % GAME_WIDTH}
              y={GAME_HEIGHT - GROUND_HEIGHT + 48}
              width="20" height="8" fill="#b8a888" rx="2"
            />
          </g>
        ))}
      </g>
    </g>
  )
}
