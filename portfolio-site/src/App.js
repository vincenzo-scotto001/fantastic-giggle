import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './pages/Home';
import CV from './pages/CV';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import CouncilOfEldersWithAPI from './pages/Councilofelderswithapi.js';

function App() {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thecouncil" element={<CouncilOfEldersWithAPI />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
