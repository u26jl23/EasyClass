import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from './components/Home'
import Teacher from "./components/Teacher"

function App(){
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/teacher" element={<Teacher/>}/>
      </Routes>
    </div>
  )
}

export default App
