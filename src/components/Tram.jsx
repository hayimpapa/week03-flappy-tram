import React from 'react'
import { COLORS } from '../constants.js'

export default function Tram({ x, y, velocity, frameCount }) {
  const rotation = Math.max(-25, Math.min(45, velocity * 4))
  const wheelRotation = (frameCount * 15) % 360
  const pantographBounce = Math.sin(frameCount * 0.3) * 2

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}, 30, 17)`}>
      {/* Pantograph (roof connector) */}
      <line
        x1="30" y1={-4 + pantographBounce}
        x2="25" y2={-10 + pantographBounce}
        stroke="#888"
        strokeWidth="1.5"
      />
      <line
        x1="30" y1={-4 + pantographBounce}
        x2="35" y2={-10 + pantographBounce}
        stroke="#888"
        strokeWidth="1.5"
      />
      <line
        x1="22" y1={-10 + pantographBounce}
        x2="38" y2={-10 + pantographBounce}
        stroke="#666"
        strokeWidth="2"
      />

      {/* Main body */}
      <rect x="2" y="0" width="56" height="26" rx="4" ry="4" fill={COLORS.tramGreen} />

      {/* Roof detail */}
      <rect x="4" y="-2" width="52" height="4" rx="2" fill="#6aa86a" />

      {/* Destination board */}
      <rect x="10" y="1" width="40" height="6" rx="1" fill="#2a5a2a" />
      <text x="30" y="6" textAnchor="middle" fill="#ffffaa" fontSize="4" fontWeight="bold">CITY</text>

      {/* Windows */}
      <rect x="6" y="9" width="10" height="8" rx="1.5" fill={COLORS.tramWindow} />
      <rect x="19" y="9" width="10" height="8" rx="1.5" fill={COLORS.tramWindow} />
      <rect x="32" y="9" width="10" height="8" rx="1.5" fill={COLORS.tramWindow} />
      <rect x="45" y="9" width="10" height="8" rx="1.5" fill={COLORS.tramWindow} />

      {/* Window dividers */}
      <line x1="11" y1="9" x2="11" y2="17" stroke={COLORS.tramGreen} strokeWidth="0.5" />
      <line x1="24" y1="9" x2="24" y2="17" stroke={COLORS.tramGreen} strokeWidth="0.5" />
      <line x1="37" y1="9" x2="37" y2="17" stroke={COLORS.tramGreen} strokeWidth="0.5" />
      <line x1="50" y1="9" x2="50" y2="17" stroke={COLORS.tramGreen} strokeWidth="0.5" />

      {/* Yellow stripe */}
      <rect x="2" y="19" width="56" height="7" rx="0" fill={COLORS.tramYellow} />
      <rect x="2" y="23" width="56" height="3" rx="0 0 4 4" fill={COLORS.tramYellow} />

      {/* Bottom trim */}
      <rect x="4" y="25" width="52" height="2" fill="#c8a830" rx="1" />

      {/* Headlight */}
      <circle cx="56" cy="15" r="2" fill="#ffffaa" />

      {/* Door */}
      <rect x="28" y="10" width="4" height="14" rx="0.5" fill="#5a9a5a" />

      {/* Wheels */}
      <g transform={`translate(14, 29)`}>
        <circle cx="0" cy="0" r="3.5" fill="#555" />
        <circle cx="0" cy="0" r="2" fill="#777" />
        <line
          x1="-1.5" y1="0" x2="1.5" y2="0"
          stroke="#555" strokeWidth="0.8"
          transform={`rotate(${wheelRotation})`}
        />
      </g>
      <g transform={`translate(46, 29)`}>
        <circle cx="0" cy="0" r="3.5" fill="#555" />
        <circle cx="0" cy="0" r="2" fill="#777" />
        <line
          x1="-1.5" y1="0" x2="1.5" y2="0"
          stroke="#555" strokeWidth="0.8"
          transform={`rotate(${wheelRotation})`}
        />
      </g>
    </g>
  )
}
