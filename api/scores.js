import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SIGNING_SECRET = process.env.SCORE_SIGNING_SECRET

// Reject scores above this — well above any realistic gameplay ceiling.
const MAX_PLAUSIBLE_SCORE = 999
// Minimum real-world elapsed time per point. Top-speed pipe spacing is ~815ms;
// 600ms leaves headroom for legit pros without giving attackers much room.
const MIN_MS_PER_POINT = 600
// A submission token is valid for up to one hour after issuance.
const TOKEN_MAX_AGE_MS = 60 * 60 * 1000
// Sanity floor — a submitted game must have lasted at least this long.
const MIN_GAME_MS = 500

// Best-effort in-memory replay cache. Vercel may run multiple instances, so
// this isn't perfect, but per-token replay across instances still can't
// inflate a score beyond what the time-budget check allows.
const usedSessions = new Map()

function pruneUsedSessions() {
  if (usedSessions.size < 5000) return
  const now = Date.now()
  for (const [sid, exp] of usedSessions) {
    if (exp < now) usedSessions.delete(sid)
  }
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SIGNING_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifyToken(token) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expected = crypto.createHmac('sha256', SIGNING_SECRET).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return null
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  }
  if (req.method === 'POST') {
    if (req.query?.action === 'start') {
      return handleStart(req, res)
    }
    return handlePost(req, res)
  }
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleGet(req, res) {
  const { data, error } = await supabase
    .from('flappy_tram_scores')
    .select('name, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch scores' })
  }

  return res.status(200).json(data)
}

async function handleStart(req, res) {
  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: 'Server not configured' })
  }
  const token = signToken({ sid: crypto.randomUUID(), iat: Date.now() })
  return res.status(200).json({ token })
}

async function handlePost(req, res) {
  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const { name, score, token } = req.body || {}

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'Valid score is required' })
  }

  const payload = verifyToken(token)
  if (!payload || typeof payload.sid !== 'string' || typeof payload.iat !== 'number') {
    return res.status(403).json({ error: 'Invalid session' })
  }

  const now = Date.now()
  const elapsed = now - payload.iat
  if (elapsed < MIN_GAME_MS || elapsed > TOKEN_MAX_AGE_MS) {
    return res.status(403).json({ error: 'Invalid session' })
  }

  const cleanName = name.trim().substring(0, 5).toUpperCase().replace(/\s/g, '')
  const roundedScore = Math.round(score)

  if (roundedScore > MAX_PLAUSIBLE_SCORE) {
    return res.status(403).json({ error: 'Invalid session' })
  }
  if (elapsed < roundedScore * MIN_MS_PER_POINT) {
    return res.status(403).json({ error: 'Invalid session' })
  }

  const existingExp = usedSessions.get(payload.sid)
  if (existingExp && existingExp > now) {
    return res.status(403).json({ error: 'Invalid session' })
  }
  usedSessions.set(payload.sid, payload.iat + TOKEN_MAX_AGE_MS)
  pruneUsedSessions()

  const { error } = await supabase
    .from('flappy_tram_scores')
    .insert({ name: cleanName, score: roundedScore })

  if (error) {
    return res.status(500).json({ error: 'Failed to save score' })
  }

  return res.status(201).json({ success: true })
}
