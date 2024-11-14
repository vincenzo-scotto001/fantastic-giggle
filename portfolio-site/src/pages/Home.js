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

  const apiKey = process.env.REACT_APP_API_KEY;
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          messages: [
            {role: 'system', content: 'You are a factual assistant, knowledgeable about Vincenzo.'},
            { role: 'user', content: userInput }],
          model: "ft:gpt-4o-2024-08-06:personal:me-v3:ATXTckgl",
          max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setLlmResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLlmResponse('Sorry, something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <h1>Welcome to my corner of the internet!</h1>
      <p>
        Hi there! I’m Vincenzo Scotto Di Uccio, a full stack data scientist with a passion for building applications and bringing ideas to life. This website showcases 
        my work, experiences, and projects. Feel free to explore and connect with me, or talk to my friend here that knows everything about me!
      </p> 

      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => { handleInputChange(e); autoExpand(e); }} // Call autoExpand on change
          placeholder="What is Vincenzo's favorite color?"
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
