# Reusable Prompt: Supabase Leaderboard

Paste the block below into a new game project (or give it to an AI coding
assistant) to add a global leaderboard that follows the exact same rules as
Flappy Tram. Before pasting, do a find-and-replace on these two placeholders:

- `<TABLE_NAME>` — the Supabase table for this game (e.g. `my_game_scores`).
  Use a unique name so multiple games can share one Supabase project.
- `<GAME_NAME>` — a short human-readable name used in copy (e.g. `My Game`).

---

## PROMPT START

Add a global online leaderboard to this game using Supabase. Follow these
rules exactly — do not invent extra features, do not change the limits, and
do not expose any Supabase keys to the browser.

### 1. Supabase table

Create (or have me create) a Supabase table named `<TABLE_NAME>` with this
schema. Provide the SQL so I can run it in the Supabase SQL editor:

```sql
create table if not exists <TABLE_NAME> (
  id bigint generated always as identity primary key,
  name varchar(5) not null,
  score integer not null check (score >= 0 and score <= 99999),
  created_at timestamptz not null default now()
);

create index if not exists <TABLE_NAME>_score_created_idx
  on <TABLE_NAME> (score desc, created_at asc);

-- Row Level Security: the server-side API uses the service role key,
-- which bypasses RLS, so we can leave RLS enabled with no policies to
-- block any direct client access.
alter table <TABLE_NAME> enable row level security;
```

### 2. Environment variables

Use these two env vars, set on the hosting platform (e.g. Vercel) and in a
local `.env.local` for development. Do NOT commit them, and do NOT read them
from client-side code:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (service role key, never the anon key)

### 3. Serverless API route

Create a single serverless function at `api/scores.js` (Vercel-style, or
the equivalent for whatever hosting is being used). It must handle both GET
and POST on the same `/api/scores` path, and it is the ONLY place that
imports `@supabase/supabase-js`. The client must never talk to Supabase
directly.

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleGet(req, res) {
  const { data, error } = await supabase
    .from('<TABLE_NAME>')
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
    .from('<TABLE_NAME>')
    .insert({ name: cleanName, score: clampedScore })

  if (error) {
    return res.status(500).json({ error: 'Failed to save score' })
  }
  return res.status(201).json({ success: true })
}
```

### 4. Hard rules (do not change any of these)

- **Max score**: 99999. Always pass player scores through a `capScore(s)`
  helper that returns `Math.min(s, 99999)` before submitting or displaying.
  The server also re-clamps via `Math.min(Math.round(score), 99999)` as a
  safety net.
- **Max name length**: 5 characters.
- **Allowed name characters**: `A–Z` and `0–9` only. Lowercase input must be
  converted to uppercase. All other characters (including spaces,
  punctuation, emoji) must be stripped on both the client and the server.
  Server sanitiser: `name.trim().substring(0, 5).toUpperCase().replace(/\s/g, '')`.
- **Leaderboard size**: Top 10 only.
- **Ordering**: `score DESC`, then `created_at ASC` (earliest submission wins
  a tie).
- **Qualification check**: A player qualifies to submit if
  `leaderboard.length < 10 || playerScore > leaderboard[leaderboard.length - 1].score`.
- **No rate limiting, no auth, no duplicate prevention, no profanity filter,
  no anti-cheat.** Keep it simple. Do not add these unless I specifically ask.

### 5. Client UI (game over screen)

On game over, the client must:

1. Call `GET /api/scores` and store the result in state.
2. Show one of these three states in the game over panel:
   - `Loading leaderboard...` while the request is in flight.
   - `Leaderboard unavailable` (in a muted red/pink) if the fetch fails.
   - The top 10 list as rows of `rank. NAME score` once loaded.
3. Compute `qualifies` using the rule in section 4.
4. If `qualifies` is true and no score has been submitted yet this game-over,
   show a name input + Submit button. Otherwise hide the input.

The name input must enforce the character and length rules in real time:

```jsx
<input
  type="text"
  maxLength={5}
  autoComplete="off"
  autoCapitalize="characters"
  value={nameInput}
  onChange={(e) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 5)
    setNameInput(val)
  }}
  placeholder="NAME"
/>
```

The Submit button must be disabled when `submitting` is true or
`nameInput.trim()` is empty. While submitting, show `...` on the button;
otherwise show `Submit`.

On submit:

1. `POST /api/scores` with body
   `{ name: <cleaned>, score: capScore(finalScore) }`, where `<cleaned>` is
   `nameInput.trim().substring(0, 5).toUpperCase().replace(/\s/g, '')`.
2. On success, mark the score as submitted (so the input disappears) and
   re-fetch `GET /api/scores` to refresh the displayed top 10.
3. On failure, flip the error state so `Leaderboard unavailable` shows. The
   game must still be playable and restartable even if the leaderboard
   endpoint is broken.

### 6. State shape (React example)

```jsx
const [leaderboard, setLeaderboard] = useState(null)
const [leaderboardError, setLeaderboardError] = useState(false)
const [leaderboardLoading, setLeaderboardLoading] = useState(false)
const [qualifies, setQualifies] = useState(false)
const [nameInput, setNameInput] = useState('')
const [submitting, setSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(false)
```

All leaderboard state must be reset when the player restarts the game.

### 7. Dependency

Add `@supabase/supabase-js` (any recent 2.x version) to `package.json`. It
should only be imported from `api/scores.js`, never from any file under the
client bundle.

### 8. Deliverables

When you're done, confirm:

1. `api/scores.js` exists and imports Supabase only there.
2. The SQL for `<TABLE_NAME>` has been given to me to run.
3. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are documented in the
   README as required env vars, with a note that the service role key must
   never be exposed to the client.
4. The game over screen shows the top 10, handles loading and error states,
   and only shows the submit form when the player qualifies.
5. Name input is capped at 5 chars and stripped to `[A-Z0-9]`; scores are
   capped at 99999 on both the client and the server.

## PROMPT END
