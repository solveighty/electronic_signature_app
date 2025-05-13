import { useState } from 'react'
import './App.css'
import Login from './renderer/src/components/Login'
import Register from './renderer/src/components/Register'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './renderer/src/components/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
