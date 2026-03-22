import React, { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Game from './components/Game.jsx'
import AboutThisBuild from './components/AboutThisBuild.jsx'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('game')

  return (
    <div className="app">
      <nav className="tab-bar">
        <a
          href="https://52-app.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="logo-link"
          title="52 Apps in 52 Weeks"
        >
          <img
            src="https://raw.githubusercontent.com/hayimpapa/week00-main-page/main/public/w52.png"
            alt="52 Apps Logo"
            className="logo-img"
          />
        </a>
        <button
          className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          Play
        </button>
        <button
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About This Build
        </button>
      </nav>
      <div className="tab-content">
        {activeTab === 'game' ? <Game /> : <AboutThisBuild />}
      </div>
      <Analytics />
    </div>
  )
}
