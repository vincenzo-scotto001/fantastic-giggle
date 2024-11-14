import React from 'react';
import '../styles/Contact.css';

const contacts = [
  {
    id: 1,
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/vincenzo-s-560938159/",
    description: "Connect with me on LinkedIn"
  },
  {
    id: 2,
    name: "GitHub",
    url: "https://github.com/vincenzo-scotto001",
    description: "Check out my projects on GitHub"
  },
  {
    id: 3,
    name: "Medium",
    url: "https://medium.com/@vincenzo.scotto001",
    description: "Read my articles on Medium"
  },
  {
    id: 4,
    name: "Email",
    url: "mailto:vincenzo.scotto001@gmail.com",
    description: "Send me an email"
  },

];

function Contact() {
  return (
    <div className="contact-container">
      <h1>Contact Me</h1>
      <div className="contact-list">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-item">
            <h2>{contact.name}</h2>
            <p>{contact.description}</p>
            <a href={contact.url} target="_blank" rel="noopener noreferrer" className="contact-link">
              Go to {contact.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contact;
