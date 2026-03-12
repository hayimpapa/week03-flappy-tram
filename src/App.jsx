import React, { useState } from 'react'
import Game from './components/Game.jsx'
import AboutThisBuild from './components/AboutThisBuild.jsx'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('game')

  return (
    <div className="app">
      <nav className="tab-bar">
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
    </div>
  )
}
