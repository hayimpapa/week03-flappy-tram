import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  }
  if (req.method === 'POST') {
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

async function handlePost(req, res) {
  const { name, score } = req.body || {}

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'Valid score is required' })
  }

  const cleanName = name.trim().substring(0, 5).toUpperCase().replace(/\s/g, '')
  const clampedScore = Math.min(Math.round(score), 99999)

  const { error } = await supabase
    .from('flappy_tram_scores')
    .insert({ name: cleanName, score: clampedScore })

  if (error) {
    return res.status(500).json({ error: 'Failed to save score' })
  }

  return res.status(201).json({ success: true })
}
