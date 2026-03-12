import React from 'react'
import { GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, COLORS } from '../constants.js'

function EurekaTower({ x, baseY }) {
  return (
    <g transform={`translate(${x}, ${baseY})`}>
      <rect x="0" y="-120" width="18" height="120" fill="#8878a8" />
      <rect x="3" y="-140" width="12" height="22" fill="#9888b8" />
      <rect x="7" y="-155" width="4" height="15" fill="#a898c8" />
      <rect x="8" y="-162" width="2" height="7" fill="#b0a0d0" />
      {/* Gold crown */}
      <rect x="2" y="-122" width="14" height="3" fill="#d4b060" />
    </g>
  )
}

function RialtoTower({ x, baseY }) {
  return (
    <g transform={`translate(${x}, ${baseY})`}>
      <rect x="0" y="-100" width="22" height="100" fill="#7868a0" />
      <rect x="4" y="-110" width="14" height="12" fill="#8878b0" />
      <rect x="8" y="-118" width="6" height="8" fill="#9888c0" />
    </g>
  )
}

function ArtsCentreSpire({ x, baseY }) {
  return (
    <g transform={`translate(${x}, ${baseY})`}>
      <rect x="0" y="-40" width="30" height="40" fill="#8070a0" />
      <polygon points="15,-130 8,-40 22,-40" fill="#9080b0" />
      <circle cx="15" cy="-40" r="5" fill="#a090c0" />
    </g>
  )
}

function GenericBuilding({ x, baseY, width, height, color }) {
  return (
    <rect x={x} y={baseY - height} width={width} height={height} fill={color} />
  )
}

function FlindersStation({ x, baseY }) {
  return (
    <g transform={`translate(${x}, ${baseY})`}>
      {/* Main facade */}
      <rect x="0" y="-60" width="120" height="60" fill="#e8d8a0" rx="2" />
      {/* Roof / upper section */}
      <rect x="-3" y="-68" width="126" height="10" fill="#d8c890" rx="2" />
      {/* Central dome */}
      <ellipse cx="60" cy="-68" rx="18" ry="14" fill="#d0c080" />
      <ellipse cx="60" cy="-68" rx="15" ry="11" fill="#e0d090" />
      {/* Clock */}
      <circle cx="60" cy="-65" r="6" fill="#fffde8" stroke="#b8a860" strokeWidth="1" />
      <line x1="60" y1="-65" x2="60" y2="-69" stroke="#665" strokeWidth="0.8" />
      <line x1="60" y1="-65" x2="63" y2="-65" stroke="#665" strokeWidth="0.8" />
      {/* Side tower left */}
      <rect x="5" y="-80" width="16" height="20" fill="#d8c890" rx="1" />
      <rect x="8" y="-88" width="10" height="8" fill="#e0d090" rx="3 3 0 0" />
      {/* Side tower right */}
      <rect x="99" y="-80" width="16" height="20" fill="#d8c890" rx="1" />
      <rect x="102" y="-88" width="10" height="8" fill="#e0d090" rx="3 3 0 0" />
      {/* Arched windows */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={i}>
          <rect x={10 + i * 18} y="-50" width="12" height="20" fill="#c8b880" rx="6 6 0 0" />
          <rect x={12 + i * 18} y="-48" width="8" height="16" fill="#fffde8" rx="4 4 0 0" />
        </g>
      ))}
      {/* Entrance arches */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={25 + i * 25} y="-25" width="18" height="25" fill="#c8b880" rx="9 9 0 0" />
          <rect x={27 + i * 25} y="-22" width="14" height="22" fill="#b8a870" rx="7 7 0 0" />
        </g>
      ))}
    </g>
  )
}

export default function Background({ scrollX }) {
  const layer1Speed = 0.05
  const layer2Speed = 0.15
  const layer3Speed = 0.3
  const layer4Speed = 1.0

  const skylineOffset = -(scrollX * layer2Speed) % 800
  const flindersOffset = -(scrollX * layer3Speed) % 600
  const groundOffset = -(scrollX * layer4Speed) % 40

  return (
    <g>
      {/* Layer 1: Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.skyTop} />
          <stop offset="100%" stopColor={COLORS.skyBottom} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#skyGradient)" />

      {/* Clouds */}
      {[0, 1, 2].map(i => {
        const cx = ((i * 180 + 50 - scrollX * layer1Speed) % (GAME_WIDTH + 100)) - 50
        return (
          <g key={`cloud-${i}`} opacity="0.5">
            <ellipse cx={cx} cy={60 + i * 40} rx={40 + i * 5} ry={12} fill="white" />
            <ellipse cx={cx + 15} cy={55 + i * 40} rx={25} ry={10} fill="white" />
            <ellipse cx={cx - 10} cy={58 + i * 40} rx={20} ry={8} fill="white" />
          </g>
        )
      })}

      {/* Layer 2: Distant Melbourne skyline */}
      <g transform={`translate(${skylineOffset}, 0)`}>
        {[0, 1].map(rep => (
          <g key={rep} transform={`translate(${rep * 800}, 0)`}>
            <GenericBuilding x={20} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={30} height={60} color="#8878a8" />
            <EurekaTower x={70} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} />
            <GenericBuilding x={110} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={25} height={50} color="#9080b0" />
            <RialtoTower x={160} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} />
            <GenericBuilding x={200} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={35} height={45} color="#8070a0" />
            <ArtsCentreSpire x={260} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} />
            <GenericBuilding x={310} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={28} height={55} color="#7868a0" />
            <GenericBuilding x={360} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={40} height={70} color="#8878a8" />
            <GenericBuilding x={420} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={22} height={40} color="#9888b8" />
            <GenericBuilding x={470} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={35} height={65} color="#8070a0" />
            <GenericBuilding x={530} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={28} height={50} color="#9080b0" />
            <GenericBuilding x={580} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={40} height={75} color="#8878a8" />
            <GenericBuilding x={640} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={30} height={55} color="#7868a0" />
            <GenericBuilding x={700} baseY={GAME_HEIGHT - GROUND_HEIGHT - 20} width={35} height={45} color="#9888b8" />
          </g>
        ))}
      </g>

      {/* Layer 3: Flinders Street Station */}
      <g transform={`translate(${flindersOffset}, 0)`}>
        <FlindersStation x={50} baseY={GAME_HEIGHT - GROUND_HEIGHT} />
        <FlindersStation x={650} baseY={GAME_HEIGHT - GROUND_HEIGHT} />
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
