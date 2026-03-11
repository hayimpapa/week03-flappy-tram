import React, { useState, useEffect } from 'react'
import './AboutThisBuild.css'

const STORAGE_KEY = 'flappyTramAbout'

const DEFAULT_SECTIONS = {
  problem: "Melbourne deserves its own Flappy Bird. Also I wanted to see if a complete browser game could be built in one week with no game dev background.",
  approach: "React with SVG/Canvas rendering, Web Audio API for sound, everything drawn in code so no external assets needed.",
  prompt: "",
  whatGotBuilt: "",
  whatIdDoDifferently: "",
  githubLink: "https://github.com/hayimpapa",
}

function loadSections() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_SECTIONS, ...JSON.parse(saved) }
  } catch {}
  return { ...DEFAULT_SECTIONS }
}

function saveSections(sections) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sections)) } catch {}
}

function EditableSection({ title, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => { setDraft(value) }, [value])

  if (editing) {
    return (
      <div className="about-section">
        <h3>{title}</h3>
        <textarea
          className="about-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          autoFocus
        />
        <div className="about-btn-row">
          <button className="about-btn save" onClick={() => { onChange(draft); setEditing(false) }}>Save</button>
          <button className="about-btn cancel" onClick={() => { setDraft(value); setEditing(false) }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="about-section" onClick={() => setEditing(true)}>
      <h3>{title}</h3>
      <p>{value || <em className="about-placeholder">Click to edit...</em>}</p>
    </div>
  )
}

export default function AboutThisBuild() {
  const [sections, setSections] = useState(loadSections)

  const updateSection = (key) => (newValue) => {
    const updated = { ...sections, [key]: newValue }
    setSections(updated)
    saveSections(updated)
  }

  return (
    <div className="about-container">
      <div className="about-card">
        <h1 className="about-title">About This Build</h1>
        <p className="about-subtitle">
          Week 3 of <strong>52 Apps in 52 Weeks Before I Turn 52</strong> by Hey I'm Papa
        </p>

        <EditableSection title="The Problem" value={sections.problem} onChange={updateSection('problem')} />
        <EditableSection title="The Approach" value={sections.approach} onChange={updateSection('approach')} />
        <EditableSection title="The Prompt" value={sections.prompt} onChange={updateSection('prompt')} />
        <EditableSection title="What Got Built" value={sections.whatGotBuilt} onChange={updateSection('whatGotBuilt')} />
        <EditableSection title="What I'd Do Differently" value={sections.whatIdDoDifferently} onChange={updateSection('whatIdDoDifferently')} />
        <EditableSection title="GitHub Link" value={sections.githubLink} onChange={updateSection('githubLink')} />

        <div className="about-footer">
          <p>Click any section to edit. Changes are saved to localStorage.</p>
        </div>
      </div>
    </div>
  )
}
