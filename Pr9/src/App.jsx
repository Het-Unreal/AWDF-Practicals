import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import RouteLoadingFallback from './components/RouteLoadingFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';

// Route-level Code Splitting with 300ms anti-flicker delay fallback
const Home = lazyWithDelay(() => import('./Pages/Home'), 300);
const Projects = lazyWithDelay(() => import('./Pages/Projects'), 300);
const Contact = lazyWithDelay(() => import('./Pages/Contact'), 300);
const NotFound = lazyWithDelay(() => import('./Pages/NotFound'), 300);

function App() {
  const myName = "Het Kathiriya";

  return (
    <div className="portfolio-container">
      <header>
        <NavBar />
        <Header name={myName} />
      </header>
      <main>
        <Suspense fallback={<RouteLoadingFallback message="Loading route chunk dynamically..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer name={myName} />
    </div>
  );
}

export default App;