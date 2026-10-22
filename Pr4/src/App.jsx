import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import Home from './Pages/Home';
import Projects from './Pages/Projects';
import Contact from './Pages/Contact';
import NotFound from './Pages/NotFound';

function App() {
  const myName = "Het Kathiriya";

  return (
    <div className="portfolio-container">
      <header>
        <NavBar />
        <Header name={myName} />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer name={myName} />
    </div>
  );
}

export default App;