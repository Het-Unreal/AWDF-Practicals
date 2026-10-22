import React from 'react'
import Header from './components/header'
import About from './components/about'
import Skills from './components/skills'
import Footer from './components/footer'
import './index.css'

function App() {
  return (
    <div className="portfolio-container">
      <Header />
      <main>
        <About />
        <Skills />
      </main>
      <Footer />
    </div>
  )
}

export default App
