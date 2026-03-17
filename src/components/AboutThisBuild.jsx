import React from 'react'
import './AboutThisBuild.css'

const REPO_NAME = 'week03-flappy-tram'
const GITHUB_URL = `https://github.com/hayimpapa/${REPO_NAME}`
const PROMPTS_URL = `${GITHUB_URL}/blob/main/PROMPTS.txt`

export default function AboutThisBuild() {
  return (
    <div className="about-container">
      <div className="about-card">
        <h1 className="about-title">About This Build</h1>
        <p className="about-subtitle">
          Week 3 of <strong>52 Apps in 52 Weeks Before I Turn 52</strong> by Hey I'm Papa
        </p>

        <div className="about-section">
          <h3>The Problem</h3>
          <p>
            Melbourne deserves its own Flappy Bird. Also I wanted to see if a complete browser game could be built in one week with no game dev background.
          </p>
        </div>

        <div className="about-section">
          <h3>The App</h3>
          <p>
            Flappy Tram is a browser-based game where you guide a Melbourne tram through gaps in obstacles, built entirely with React and SVG — no external game assets required.
          </p>
        </div>

        <div className="about-section">
          <h3>The Prompt</h3>
          <a href={PROMPTS_URL} target="_blank" rel="noopener noreferrer" className="about-link">
            View the prompt used to build this app
          </a>
        </div>

        <div className="about-section">
          <h3>GitHub Repo</h3>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="about-github-btn">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
