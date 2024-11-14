import React from 'react';
import '../styles/Projects.css';

const projects = [
  {
    id: 1,
    title: "TournyTracker",
    description: "A poker tournament tracking app with features for logging tournaments, buy-ins, and cash-outs.",
    technologies: "React, TypeScript, Firebase"
  },
  {
    id: 2,
    title: "My Portfolio",
    description: "A personal portfolio website showcasing my projects and experience.",
    technologies: "React, CSS, HTML, LLM"
  },
  {
    id: 3,
    title: "Oden - My Personal Security System",
    description: "Full stack app that alerts me of motion at my front door.",
    technologies: "Python, Flask, Machine Learning, Git",
    link: "https://medium.com/@vincenzo.scotto001/introducing-oden-my-personal-security-system-b09f411e4d69"
  },
  {
    id: 4,
    title: "Weather Station",
    description: "Built a temperature and humidity station for my parents attic.",
    technologies: "RasPI4, Python, Flask, Git, SQLite",
    link: "https://medium.com/@vincenzo.scotto001/attempting-to-make-a-novice-weather-station-using-raspi-4-dht22-sensor-and-python-5e3411e40b6d"

  }
  // Add more projects as needed
];

function Projects() {
    return (
      <div className="projects-container">
        <h1>Personal Projects</h1>
        <div className="project-list">
          {projects.map((project) => (
            <div key={project.id} className="project-item">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <p><strong>Technologies:</strong> {project.technologies}</p>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                  View Project
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default Projects;
