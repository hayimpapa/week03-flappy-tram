import React from 'react'
import { GAME_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH, COLORS } from '../constants.js'

export default function Obstacle({ x, gapY, gapSize }) {
  const topPipeBottom = gapY - gapSize / 2
  const bottomPipeTop = gapY + gapSize / 2
  const bottomPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomPipeTop

  return (
    <g>
      {/* Top pole */}
      <rect
        x={x} y={0}
        width={PIPE_WIDTH} height={topPipeBottom}
        fill={COLORS.poleTeal}
        rx="4"
      />
      {/* Top pole cap */}
      <rect
        x={x - 4} y={topPipeBottom - 20}
        width={PIPE_WIDTH + 8} height={20}
        fill="#5aa8a0"
        rx="3"
      />
      {/* Top pole stripes */}
      {Array.from({ length: Math.floor(topPipeBottom / 30) }, (_, i) => (
        <rect
          key={`ts-${i}`}
          x={x + 4} y={i * 30 + 5}
          width={PIPE_WIDTH - 8} height="3"
          fill="#88d0c8" rx="1" opacity="0.5"
        />
      ))}
      {/* STOP sign on top pole */}
      <g transform={`translate(${x + PIPE_WIDTH / 2}, ${topPipeBottom - 30})`}>
        <rect x="-18" y="-8" width="36" height="16" rx="3" fill={COLORS.poleSign} />
        <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">STOP</text>
      </g>

      {/* Bottom pole */}
      <rect
        x={x} y={bottomPipeTop}
        width={PIPE_WIDTH} height={bottomPipeHeight}
        fill={COLORS.poleTeal}
        rx="4"
      />
      {/* Bottom pole cap */}
      <rect
        x={x - 4} y={bottomPipeTop}
        width={PIPE_WIDTH + 8} height={20}
        fill="#5aa8a0"
        rx="3"
      />
      {/* Bottom pole stripes */}
      {Array.from({ length: Math.floor(bottomPipeHeight / 30) }, (_, i) => (
        <rect
          key={`bs-${i}`}
          x={x + 4} y={bottomPipeTop + 25 + i * 30}
          width={PIPE_WIDTH - 8} height="3"
          fill="#88d0c8" rx="1" opacity="0.5"
        />
      ))}
      {/* Tram stop shelter on bottom */}
      <g transform={`translate(${x + PIPE_WIDTH / 2}, ${bottomPipeTop + 8})`}>
        <rect x="-14" y="-4" width="28" height="12" rx="2" fill="#4a9890" />
        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">TRAM</text>
      </g>
    </g>
  )
}
