import React from 'react';
import { Link } from 'react-router-dom';
import "../src/styles/NavBar.css"


function NavBar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/cv">CV</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/thecouncil">The Council of Elders</Link></li>

      </ul>
    </nav>
  );
}

export default NavBar;
