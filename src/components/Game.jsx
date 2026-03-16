import React, { useState, useEffect, useRef, useCallback } from 'react'
import Background from './Background.jsx'
import Tram from './Tram.jsx'
import Obstacle from './Obstacle.jsx'
import { playFlapSound, playScoreSound, playCollisionSound } from '../audio.js'
import {
  GAME_WIDTH, GAME_HEIGHT, TRAM_WIDTH, TRAM_HEIGHT, TRAM_X,
  GRAVITY, FLAP_VELOCITY, MAX_FALL_SPEED,
  PIPE_WIDTH, PIPE_GAP_BASE, PIPE_GAP_MIN, PIPE_SPEED_BASE, PIPE_SPEED_MAX,
  PIPE_SPACING, GROUND_HEIGHT,
  SPEED_INCREASE_INTERVAL, SPEED_INCREASE_AMOUNT,
  GAP_DECREASE_INTERVAL, GAP_DECREASE_AMOUNT,
} from '../constants.js'
import './Game.css'

const GAME_STATES = { IDLE: 'idle', PLAYING: 'playing', GAME_OVER: 'gameover' }

function getHighScore() {
  try { return parseInt(localStorage.getItem('flappyTramHighScore') || '0', 10) } catch { return 0 }
}
function setHighScore(s) {
  try { localStorage.setItem('flappyTramHighScore', String(s)) } catch {}
}

export default function Game() {
  const [containerSize, setContainerSize] = useState({ width: 400, height: 600 })
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const gameStateRef = useRef(GAME_STATES.IDLE)
  const [gameState, setGameState] = useState(GAME_STATES.IDLE)
  const [score, setScore] = useState(0)
  const [highScore, setHighScoreState] = useState(getHighScore())
  const [displayState, setDisplayState] = useState({
    tramY: GAME_HEIGHT / 2 - TRAM_HEIGHT / 2,
    tramVelocity: 0,
    obstacles: [],
    scrollX: 0,
    frameCount: 0,
  })

  const tramYRef = useRef(GAME_HEIGHT / 2 - TRAM_HEIGHT / 2)
  const velocityRef = useRef(0)
  const obstaclesRef = useRef([])
  const scrollXRef = useRef(0)
  const scoreRef = useRef(0)
  const frameCountRef = useRef(0)
  const animFrameRef = useRef(null)
  const lastTimeRef = useRef(0)

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const getCurrentDifficulty = useCallback(() => {
    const s = scoreRef.current
    const speed = Math.min(
      PIPE_SPEED_MAX,
      PIPE_SPEED_BASE + Math.floor(s / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT
    )
    const gap = Math.max(
      PIPE_GAP_MIN,
      PIPE_GAP_BASE - Math.floor(s / GAP_DECREASE_INTERVAL) * GAP_DECREASE_AMOUNT
    )
    return { speed, gap }
  }, [])

  const spawnObstacle = useCallback((startX) => {
    const { gap } = getCurrentDifficulty()
    const minY = gap / 2 + 40
    const maxY = GAME_HEIGHT - GROUND_HEIGHT - gap / 2 - 40
    const gapY = minY + Math.random() * (maxY - minY)
    return { x: startX, gapY, gapSize: gap, scored: false }
  }, [getCurrentDifficulty])

  const resetGame = useCallback(() => {
    tramYRef.current = GAME_HEIGHT / 2 - TRAM_HEIGHT / 2
    velocityRef.current = 0
    obstaclesRef.current = []
    scrollXRef.current = 0
    scoreRef.current = 0
    frameCountRef.current = 0
    setScore(0)
  }, [])

  const flap = useCallback(() => {
    if (gameStateRef.current === GAME_STATES.GAME_OVER) return

    if (gameStateRef.current === GAME_STATES.IDLE) {
      resetGame()
      gameStateRef.current = GAME_STATES.PLAYING
      setGameState(GAME_STATES.PLAYING)
      // Spawn initial obstacles
      obstaclesRef.current = [
        spawnObstacle(GAME_WIDTH + 100),
        spawnObstacle(GAME_WIDTH + 100 + PIPE_SPACING),
        spawnObstacle(GAME_WIDTH + 100 + PIPE_SPACING * 2),
      ]
    }

    velocityRef.current = FLAP_VELOCITY
    playFlapSound()
  }, [resetGame, spawnObstacle])

  const handleGameOver = useCallback(() => {
    gameStateRef.current = GAME_STATES.GAME_OVER
    setGameState(GAME_STATES.GAME_OVER)
    playCollisionSound()
    const finalScore = scoreRef.current
    const hs = getHighScore()
    if (finalScore > hs) {
      setHighScore(finalScore)
      setHighScoreState(finalScore)
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const restartTriggerRef = useRef(0)
  const [restartTrigger, setRestartTrigger] = useState(0)

  const restart = useCallback(() => {
    resetGame()
    gameStateRef.current = GAME_STATES.IDLE
    setGameState(GAME_STATES.IDLE)
    setDisplayState({
      tramY: GAME_HEIGHT / 2 - TRAM_HEIGHT / 2,
      tramVelocity: 0,
      obstacles: [],
      scrollX: 0,
      frameCount: 0,
    })
    // Bump restart trigger to re-run the game loop useEffect
    restartTriggerRef.current++
    setRestartTrigger(restartTriggerRef.current)
  }, [resetGame])

  // Game loop
  useEffect(() => {
    const TARGET_FRAME_MS = 1000 / 60 // normalize to 60fps

    const gameLoop = (timestamp) => {
      // Calculate delta time factor (1.0 at 60fps, 0.5 at 120fps, etc.)
      const elapsed = lastTimeRef.current ? timestamp - lastTimeRef.current : TARGET_FRAME_MS
      lastTimeRef.current = timestamp
      const dt = Math.min(elapsed / TARGET_FRAME_MS, 3) // cap at 3x to avoid spiral of death

      if (gameStateRef.current !== GAME_STATES.PLAYING) {
        // Idle animation
        if (gameStateRef.current === GAME_STATES.IDLE) {
          frameCountRef.current += dt
          const bobY = GAME_HEIGHT / 2 - TRAM_HEIGHT / 2 + Math.sin(frameCountRef.current * 0.05) * 8
          setDisplayState({
            tramY: bobY,
            tramVelocity: 0,
            obstacles: [],
            scrollX: frameCountRef.current * 0.5,
            frameCount: frameCountRef.current,
          })
        }
        animFrameRef.current = requestAnimationFrame(gameLoop)
        return
      }

      frameCountRef.current += dt

      // Physics - normalized to 60fps
      velocityRef.current = Math.min(velocityRef.current + GRAVITY * dt, MAX_FALL_SPEED)
      tramYRef.current += velocityRef.current * dt

      const { speed, gap } = getCurrentDifficulty()
      scrollXRef.current += speed * dt

      // Move obstacles
      const obs = obstaclesRef.current
      for (let i = 0; i < obs.length; i++) {
        obs[i].x -= speed * dt
      }

      // Score
      for (let i = 0; i < obs.length; i++) {
        if (!obs[i].scored && obs[i].x + PIPE_WIDTH < TRAM_X) {
          obs[i].scored = true
          scoreRef.current++
          setScore(scoreRef.current)
          playScoreSound()
        }
      }

      // Remove off-screen and spawn new
      while (obs.length > 0 && obs[0].x < -PIPE_WIDTH - 10) {
        obs.shift()
      }
      if (obs.length > 0) {
        const lastObs = obs[obs.length - 1]
        if (lastObs.x < GAME_WIDTH - PIPE_SPACING + 50) {
          obs.push(spawnObstacle(lastObs.x + PIPE_SPACING))
        }
      }

      // Collision detection
      const tramTop = tramYRef.current
      const tramBottom = tramYRef.current + TRAM_HEIGHT
      const tramLeft = TRAM_X + 5 // slight hitbox inset
      const tramRight = TRAM_X + TRAM_WIDTH - 5

      // Ground/ceiling
      if (tramBottom >= GAME_HEIGHT - GROUND_HEIGHT || tramTop <= 0) {
        tramYRef.current = tramBottom >= GAME_HEIGHT - GROUND_HEIGHT
          ? GAME_HEIGHT - GROUND_HEIGHT - TRAM_HEIGHT
          : 0
        handleGameOver()
        setDisplayState({
          tramY: tramYRef.current,
          tramVelocity: velocityRef.current,
          obstacles: [...obs],
          scrollX: scrollXRef.current,
          frameCount: frameCountRef.current,
        })
        return
      }

      // Obstacle collision
      for (let i = 0; i < obs.length; i++) {
        const o = obs[i]
        const pipeLeft = o.x
        const pipeRight = o.x + PIPE_WIDTH

        if (tramRight > pipeLeft && tramLeft < pipeRight) {
          const gapTop = o.gapY - o.gapSize / 2
          const gapBottom = o.gapY + o.gapSize / 2
          if (tramTop < gapTop || tramBottom > gapBottom) {
            handleGameOver()
            setDisplayState({
              tramY: tramYRef.current,
              tramVelocity: velocityRef.current,
              obstacles: [...obs],
              scrollX: scrollXRef.current,
              frameCount: frameCountRef.current,
            })
            return
          }
        }
      }

      setDisplayState({
        tramY: tramYRef.current,
        tramVelocity: velocityRef.current,
        obstacles: [...obs],
        scrollX: scrollXRef.current,
        frameCount: frameCountRef.current,
      })

      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [getCurrentDifficulty, handleGameOver, spawnObstacle, restartTrigger])

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (gameStateRef.current === GAME_STATES.GAME_OVER) {
          restart()
        } else {
          flap()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flap, restart])

  const handleTap = useCallback((e) => {
    e.preventDefault()
    if (gameStateRef.current === GAME_STATES.GAME_OVER) {
      restart()
    } else {
      flap()
    }
  }, [flap, restart])

  const scale = Math.min(containerSize.width / GAME_WIDTH, containerSize.height / GAME_HEIGHT)
  const scaledW = GAME_WIDTH * scale
  const scaledH = GAME_HEIGHT * scale

  return (
    <div
      ref={containerRef}
      className="game-container"
      onMouseDown={handleTap}
      onTouchStart={handleTap}
    >
      <svg
        ref={svgRef}
        width={scaledW}
        height={scaledH}
        viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}
        className="game-svg"
      >
        <Background scrollX={displayState.scrollX} />

        {displayState.obstacles.map((obs, i) => (
          <Obstacle key={i} x={obs.x} gapY={obs.gapY} gapSize={obs.gapSize} />
        ))}

        <Tram
          x={TRAM_X}
          y={displayState.tramY}
          velocity={displayState.tramVelocity}
          frameCount={displayState.frameCount}
        />

        {/* Score */}
        {gameState !== GAME_STATES.IDLE && (
          <>
            <text
              x={GAME_WIDTH / 2} y={45}
              textAnchor="middle"
              fill="white"
              fontSize="36"
              fontWeight="bold"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              paintOrder="stroke"
            >
              {score}
            </text>
            <text
              x={GAME_WIDTH - 10} y={30}
              textAnchor="end"
              fill="rgba(255,255,255,0.6)"
              fontSize="14"
              fontWeight="bold"
            >
              Best: {highScore}
            </text>
          </>
        )}

        {/* Start screen */}
        {gameState === GAME_STATES.IDLE && (
          <g>
            <rect x={GAME_WIDTH / 2 - 130} y={100} width={260} height={70} rx="12" fill="rgba(60,40,80,0.75)" />
            <text
              x={GAME_WIDTH / 2} y={132}
              textAnchor="middle"
              fill="#f0d0e8"
              fontSize="30"
              fontWeight="bold"
            >
              Flappy Tram
            </text>
            <text
              x={GAME_WIDTH / 2} y={155}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="12"
            >
              Melbourne, Australia
            </text>

            <rect x={GAME_WIDTH / 2 - 110} y={200} width={220} height={36} rx="8" fill="rgba(60,40,80,0.6)" />
            <text
              x={GAME_WIDTH / 2} y={223}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize="14"
            >
              Tap or press Space to start
            </text>

            {highScore > 0 && (
              <text
                x={GAME_WIDTH / 2} y={260}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="13"
              >
                High Score: {highScore}
              </text>
            )}
          </g>
        )}

        {/* Game over screen */}
        {gameState === GAME_STATES.GAME_OVER && (
          <g>
            <rect x={GAME_WIDTH / 2 - 110} y={150} width={220} height={200} rx="15" fill="rgba(40,30,60,0.85)" />
            <text
              x={GAME_WIDTH / 2} y={190}
              textAnchor="middle"
              fill="#f0d0e8"
              fontSize="26"
              fontWeight="bold"
            >
              Game Over
            </text>
            <text
              x={GAME_WIDTH / 2} y={230}
              textAnchor="middle"
              fill="white"
              fontSize="16"
            >
              Score: {score}
            </text>
            <text
              x={GAME_WIDTH / 2} y={260}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="14"
            >
              Best: {Math.max(highScore, score)}
            </text>

            {/* Restart button */}
            <rect
              x={GAME_WIDTH / 2 - 60} y={280}
              width={120} height={40}
              rx="10"
              fill="#7ab87a"
              className="restart-btn"
            />
            <text
              x={GAME_WIDTH / 2} y={305}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
              pointerEvents="none"
            >
              Restart
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
