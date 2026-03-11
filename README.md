# Flappy Tram

A Flappy Bird clone set in Melbourne, Australia. Fly a classic W-class tram through the city skyline, dodging tram stop poles along the way.

**Week 3** of *52 Apps in 52 Weeks Before I Turn 52* by [Hey I'm Papa](https://github.com/hayimpapa).

## Features

- Classic Flappy Bird mechanics with Melbourne theming
- Parallax scrolling background featuring Eureka Tower, Rialto, Arts Centre spire, and Flinders Street Station
- All visuals are code-generated SVG — no external image assets
- Web Audio API sound effects (tram bell ding, collision)
- Difficulty scaling: speed increases every 10 points, gap shrinks every 20 points
- High score saved to localStorage
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
```

Output is in the `dist/` folder, ready to deploy to Vercel or any static host.

## Controls

- **Desktop:** Press Space or Up Arrow to flap
- **Mobile:** Tap anywhere on screen to flap
- Game starts on first flap/tap

## Tech Stack

- React 18 + Vite
- SVG rendering (all visuals drawn in code)
- Web Audio API (generated tones, no audio files)
- localStorage for high scores and about page content

## Note on Assets

All visuals in this game are generated entirely with SVG elements in React components. There are no external image files, sprites, or downloaded assets. The Melbourne skyline, tram, obstacles, and UI are all drawn programmatically.

## Prompts

See [PROMPTS.txt](./PROMPTS.txt) for the full prompt used to generate this project.

## Links

- GitHub: [https://github.com/hayimpapa](https://github.com/hayimpapa)
