import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Home.css';

function Home() {
  const [userInput, setUserInput] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // Auto-expand function
  const autoExpand = (event) => {
    const textarea = event.target;
    textarea.style.height = "50px"; // Reset height to calculate new height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post('/api', { userInput });
      setLlmResponse(response.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Check if it's a 400 error with the specific message
      if (error.response && error.response.status === 400) {
        setLlmResponse(error.response.data.result || 'Please type a question.');
      } else {
        setLlmResponse('Sorry, something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Welcome to my corner of the internet!</h1>
      <p>
      Hi there! I'm Vincenzo Scotto Di Uccio, a full stack data scientist passionate about building innovative applications. 
      Feel free to explore my work and projects, or chat with CenzGPT to learn more about me!
      </p> 

      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => { handleInputChange(e); autoExpand(e); }} // Call autoExpand on change
          placeholder="Please ask me a question!"
          rows="1" // Initial row count
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      <div>
        {llmResponse && (
          <div>
            <h3>Response:</h3>
            <p>{llmResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
