import About from '../components/About';
import Skills from '../components/Skills';
import { useState, useEffect } from 'react';

export default function Home() {
  const mySkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python'];
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);
  
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Home Page</h2>
        <button  
          onClick={() => setIsLightMode(!isLightMode)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isLightMode ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
        </button>
      </div>
      <About />
      <Skills skillList={mySkills} />
    </section>
  );
}