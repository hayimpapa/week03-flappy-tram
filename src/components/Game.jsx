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
  SPEED_MILESTONES,
} from '../constants.js'
import './Game.css'

const GAME_STATES = { IDLE: 'idle', PLAYING: 'playing', GAME_OVER: 'gameover' }

function getHighScore() {
  try { return parseInt(localStorage.getItem('flappyTramHighScore') || '0', 10) } catch { return 0 }
}
function setHighScore(s) {
  try { localStorage.setItem('flappyTramHighScore', String(s)) } catch {}
}

function capScore(s) {
  return Math.min(s, 99999)
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

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState(null)
  const [leaderboardError, setLeaderboardError] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [qualifies, setQualifies] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const tramYRef = useRef(GAME_HEIGHT / 2 - TRAM_HEIGHT / 2)
  const velocityRef = useRef(0)
  const obstaclesRef = useRef([])
  const scrollXRef = useRef(0)
  const scoreRef = useRef(0)
  const frameCountRef = useRef(0)
  const animFrameRef = useRef(null)
  const lastTimeRef = useRef(0)
  const gameOverTimeRef = useRef(0)

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

  const fetchLeaderboard = useCallback(async (playerScore) => {
    setLeaderboardLoading(true)
    setLeaderboardError(false)
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeaderboard(data)
      const qualifiesForBoard = data.length < 10 || playerScore > data[data.length - 1].score
      setQualifies(qualifiesForBoard)
    } catch {
      setLeaderboardError(true)
      setQualifies(false)
    } finally {
      setLeaderboardLoading(false)
    }
  }, [])

  const submitScore = useCallback(async () => {
    if (!nameInput.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim().substring(0, 5).toUpperCase().replace(/\s/g, ''),
          score: capScore(scoreRef.current),
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
      // Refresh leaderboard
      const refreshRes = await fetch('/api/scores')
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setLeaderboard(data)
      }
    } catch {
      setLeaderboardError(true)
    } finally {
      setSubmitting(false)
    }
  }, [nameInput, submitting])

  const getCurrentDifficulty = useCallback(() => {
    const s = scoreRef.current
    let milestoneBonus = 0
    for (const m of SPEED_MILESTONES) {
      if (s > m.score) milestoneBonus += m.bonus
    }
    const speed = Math.min(
      PIPE_SPEED_MAX,
      PIPE_SPEED_BASE + Math.floor(s / SPEED_INCREASE_INTERVAL) * SPEED_INCREASE_AMOUNT + milestoneBonus
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
    gameOverTimeRef.current = Date.now()
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
    // Reset leaderboard state and fetch
    setLeaderboard(null)
    setLeaderboardError(false)
    setQualifies(false)
    setNameInput('')
    setSubmitted(false)
    fetchLeaderboard(finalScore)
  }, [fetchLeaderboard])

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
    // Reset leaderboard state
    setLeaderboard(null)
    setLeaderboardError(false)
    setQualifies(false)
    setNameInput('')
    setSubmitted(false)
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
    const RESTART_COOLDOWN_MS = 1500
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (gameStateRef.current === GAME_STATES.GAME_OVER) {
          if (Date.now() - gameOverTimeRef.current < RESTART_COOLDOWN_MS) return
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
      // Don't restart on tap if interacting with leaderboard UI
      return
    }
    flap()
  }, [flap])

  const handleRestartClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (Date.now() - gameOverTimeRef.current < 1500) return
    restart()
  }, [restart])

  const scale = Math.min(containerSize.width / GAME_WIDTH, containerSize.height / GAME_HEIGHT)
  const scaledW = GAME_WIDTH * scale
  const scaledH = GAME_HEIGHT * scale

  // Whether to show the name entry row
  const showNameEntry = qualifies && !submitted && !leaderboardLoading && !leaderboardError

  return (
    <div
      ref={containerRef}
      className="game-container"
      onMouseDown={handleTap}
      onTouchStart={handleTap}
    >
      <div className="game-wrapper" style={{ width: scaledW, height: scaledH, position: 'relative' }}>
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
                {capScore(score)}
              </text>
              <text
                x={GAME_WIDTH - 10} y={30}
                textAnchor="end"
                fill="rgba(255,255,255,0.6)"
                fontSize="14"
                fontWeight="bold"
              >
                Best: {capScore(highScore)}
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
                  High Score: {capScore(highScore)}
                </text>
              )}
            </g>
          )}
        </svg>

        {/* Game over HTML overlay */}
        {gameState === GAME_STATES.GAME_OVER && (
          <div
            className="gameover-overlay"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="gameover-panel">
              <div className="gameover-title">Game Over</div>
              <div className="gameover-score">Score: {capScore(score)}</div>
              <div className="gameover-best">Best: {capScore(Math.max(highScore, score))}</div>

              {leaderboardLoading && (
                <div className="gameover-status">Loading leaderboard...</div>
              )}

              {leaderboardError && !leaderboard && (
                <div className="gameover-status gameover-error">Leaderboard unavailable</div>
              )}

              {/* Name entry for qualifying scores */}
              {showNameEntry && (
                <div className="gameover-qualify">
                  <div className="gameover-qualify-msg">You made the top 10!</div>
                  <form
                    className="gameover-name-form"
                    onSubmit={(e) => { e.preventDefault(); submitScore() }}
                  >
                    <input
                      type="text"
                      maxLength={5}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      value={nameInput}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)
                        setNameInput(val)
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="NAME"
                      className="leaderboard-input"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="gameover-submit-btn"
                      disabled={submitting || !nameInput.trim()}
                    >
                      {submitting ? '...' : 'Submit'}
                    </button>
                  </form>
                </div>
              )}

              {/* Leaderboard table */}
              {leaderboard && leaderboard.length > 0 && (
                <div className="gameover-leaderboard">
                  <div className="gameover-lb-title">Top 10 Leaderboard</div>
                  <div className="gameover-lb-divider" />
                  <div className="gameover-lb-list">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="gameover-lb-row">
                        <span className="gameover-lb-rank">{i + 1}.</span>
                        <span className="gameover-lb-name">{entry.name}</span>
                        <span className="gameover-lb-score">{capScore(entry.score)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leaderboard && leaderboard.length === 0 && !leaderboardLoading && (
                <div className="gameover-status">No scores yet. Be the first!</div>
              )}

              <button
                className="gameover-restart-btn"
                onMouseDown={handleRestartClick}
                onTouchStart={handleRestartClick}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
