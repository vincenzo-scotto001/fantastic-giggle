import React from 'react';
import '../styles/CV.css';

const experiences = [
  {
    id: 1,
    title: "Associate Director of Data Science",
    company: "Publicis Groupe",
    time: "April 2025 - Now",
    description: "Here I lead our the analytics of LAL, propensity and predictive models. I am also leading the charge on automation and GenAI initiatives.",
    
  },
  {
    id: 2,
    title: "Head of Long-term Forecasting",
    company: "KraftHeinz Company",
    time: "Aug. 2023 - Now",
    description: "Here our team worked on long term forecasting (4+ months), and GenAI implementations.",
  },
  {
    id: 3,
    title: "Head of Data Science",
    company: "Venetian Las Vegas",
    time: "Feb. 2022 - Aug. 2023",
    description: "Here our team successfully delivered the Venetian’s first DS/ML projects, like the ability to measure the worth of patrons or the ability to forecast housekeeper need.",
    
  },
  {
    id: 4,
    title: "Lead Data Scientist",
    company: "DuPont/IFF Nutrition and Biosciences",
    time: "Jan. 2019 - Feb. 2022",
    description: "Focused on real-time optimization projects, from pectin optimization to recipe optimization.",
    
  },
];

const education = [
    {
        id: 1,
        school: "MIT",
        degree: "Masters",
        field: "Data Science",
        years: "2020 - 2024"
      },
      {
        id: 2,
        school: "Temple University",
        degree: "Professional Science Masters",
        field: "Bioinnovation",
        years: "2017 - 2018"
      },
      {
        id: 3,
        school: "Albright College",
        degree: "Bachelors of Science",
        field: "Biology and Computer Science",
        years: "2013 - 2017"
      },
]

function CV() {
  return (
    <div className="cv-container">
      <h1>Curriculum Vitae</h1>
      <p>Download my resume below:</p>
      <a href="/VSDU_JR_08_02_2024.pdf" download>
        <button>Download Resume</button>
      </a>
{/* Experience Section */}
<h2>Professional Experience</h2>
      <div className="experience-list">
        {experiences.map((experience) => (
          <div key={experience.id} className="experience-item">
            <h3>{experience.title}</h3>
            <h4>{experience.company}</h4>
            <p2>{experience.description}</p2>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <h2>Education</h2>
      <div className="education-list">
        {education.map((edu) => (
          <div key={edu.id} className="education-item">
            <h3>{edu.degree} in {edu.field}</h3>
            <h4>{edu.school}</h4>
            <p2>{edu.years}</p2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CV;
