import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { PlayerProvider } from './PlayerContext.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(
  <BrowserRouter><PlayerProvider><App /></PlayerProvider></BrowserRouter>
)
