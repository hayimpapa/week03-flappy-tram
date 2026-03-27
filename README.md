# Flappy Tram

A Flappy Bird clone set in Melbourne, Australia. Fly a classic W-class tram through the city skyline, dodging tram stop poles along the way.

**Week 3** of *52 Apps in 52 Weeks Before I Turn 52* by [Hey I'm Papa](https://github.com/hayimpapa).

## Features

- Classic Flappy Bird mechanics with Melbourne theming
- Parallax scrolling background image featuring Melbourne landmarks (Eureka Tower, Rialto, Arts Centre spire, Flinders Street Station)
- Tram, obstacles, ground, and UI drawn with code-generated SVG
- Web Audio API sound effects (flap, score ding, collision) — no audio files
- Difficulty scaling: speed increases every 10 points, gap shrinks every 20 points
- High score saved to localStorage
- Online leaderboard (top 10 scores via Supabase)
- Works on desktop (keyboard) and mobile (tap)
- "About This Build" page with editable sections saved to localStorage

## How to Run Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

Output is in the `dist/` folder, ready to deploy to Vercel or any static host.

## Controls

- **Desktop:** Press Space or Up Arrow to flap
- **Mobile:** Tap anywhere on screen to flap
- Game starts on first flap/tap

## Tech Stack

- React 18 + Vite
- SVG rendering for tram, obstacles, ground, and UI
- PNG background image (`public/melbourne.png`) for the Melbourne skyline
- Web Audio API (generated tones, no audio files)
- Supabase for online leaderboard
- Vercel Analytics
- localStorage for high scores and about page content

## Assets

The tram, obstacles (tram stop poles), ground, and all UI elements are generated entirely with SVG in React components. The Melbourne skyline background is a PNG image (`public/melbourne.png`) used for parallax scrolling.

## Prompts

See [PROMPTS.txt](./PROMPTS.txt) for the full prompt used to generate this project.

## Links

- GitHub: [https://github.com/hayimpapa](https://github.com/hayimpapa)
