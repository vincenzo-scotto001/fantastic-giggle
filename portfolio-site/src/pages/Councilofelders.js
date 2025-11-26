import React, { useState, useEffect, useRef } from 'react';
import '../styles/CouncilOfElders.css';

const CouncilOfElders = () => {
  // Elder data with personalities
  const elders = [
    { id: 1, name: "The Gambler", description: "Impulsive risk-taker who treats life like a game of chance, always betting on long shots and chasing the thrill of uncertainty", points: 0 },
    { id: 2, name: "The Liar", description: "Compulsive storyteller who embellishes truth into fiction, creates elaborate tales to seem more interesting or escape accountability", points: 0 },
    { id: 3, name: "The Contrarian", description: "Automatically opposes popular opinion just to be different, finds satisfaction in playing devil's advocate even when they secretly agree", points: 0 },
    { id: 4, name: "The Hoarder", description: "Obsessive collector who can't let anything go, surrounds themselves with objects 'just in case' and finds comfort in accumulation", points: 0 },
    { id: 5, name: "The Conspiracy Theorist", description: "Sees hidden patterns and secret agendas everywhere, connects unrelated dots into elaborate explanations that 'they' don't want you to know", points: 0 },
    { id: 6, name: "The Hypochondriac", description: "Constantly convinced they're developing some rare disease, interprets every minor symptom as evidence of serious illness", points: 0 },
    { id: 7, name: "The Name-Dropper", description: "Casually mentions famous people or exclusive experiences to impress others, derives self-worth from proximity to status", points: 0 },
    { id: 8, name: "The Doomsayer", description: "Always predicting the worst possible outcome, finds strange comfort in catastrophic thinking and saying 'I told you so'", points: 0 },
    { id: 9, name: "The Peter Pan", description: "Refuses to embrace adult responsibilities, clings to youthful habits and dreams while avoiding commitment or serious planning", points: 0 },
    { id: 10, name: "The Adventurer", description: "Spontaneous, energetic, always seeking new experiences and thrives on excitement and unpredictability", points: 0 },
    { id: 11, name: "The Nurturer", description: "Warm, empathetic, finds fulfillment in caring for others and creating harmony in relationships", points: 0 },
    { id: 12, name: "The Analyst", description: "Logical, systematic, enjoys solving complex problems through careful observation and reasoning", points: 0 },
    { id: 13, name: "The Visionary", description: "Imaginative, forward-thinking, constantly generating innovative ideas and seeing possibilities others miss", points: 0 },
    { id: 14, name: "The Perfectionist", description: "Detail-oriented, disciplined, holds high standards and strives for excellence in everything", points: 0 },
    { id: 15, name: "The Diplomat", description: "Tactful, accommodating, skilled at mediating conflicts and finding common ground between different viewpoints", points: 0 },
    { id: 16, name: "The Leader", description: "Confident, decisive, naturally takes charge and motivates others toward shared goals", points: 0 },
    { id: 17, name: "The Entertainer", description: "Charismatic, expressive, loves being the center of attention and making people laugh", points: 0 },
    { id: 18, name: "The Loyalist", description: "Dependable, security-conscious, deeply values trust and commitment in relationships", points: 0 },
    { id: 19, name: "The Free Spirit", description: "Unconventional, independent, resists conformity and follows their own unique path", points: 0 },
    { id: 20, name: "The Protector", description: "Responsible, practical, takes pride in maintaining stability and looking after loved ones", points: 0 },
    { id: 21, name: "The Skeptic", description: "Questioning, vigilant, challenges assumptions and looks for underlying motives", points: 0 },
    { id: 22, name: "The Optimist", description: "Positive, resilient, sees opportunities in setbacks and maintains hope even in difficult times", points: 0 },
    { id: 23, name: "The Achiever", description: "Ambitious, competitive, measures self-worth through accomplishments and recognition", points: 0 },
    { id: 24, name: "The Philosopher", description: "Introspective, contemplative, drawn to exploring life's deeper meanings and abstract concepts", points: 0 },
    { id: 25, name: "The Traditionalist", description: "Principled, organized, respects established rules and values continuity with the past", points: 0 },
    { id: 26, name: "The Peacemaker", description: "Easygoing, receptive, avoids confrontation and prefers to go with the flow", points: 0 },
    { id: 27, name: "The Advocate", description: "Passionate, idealistic, fights for causes they believe in and champions the underrepresented", points: 0 },
    { id: 28, name: "The Artisan", description: "Creative, hands-on, expresses themselves through crafting, building, or artistic pursuits", points: 0 },
    { id: 29, name: "The Sage", description: "Wise, experienced, offers thoughtful counsel drawn from years of observation and reflection", points: 0 }
  ];

  // State management
  const [eldersList, setEldersList] = useState(elders);
  const [question, setQuestion] = useState('');
  const [debateMessages, setDebateMessages] = useState([]);
  const [selectedElders, setSelectedElders] = useState([]);
  const [isDebating, setIsDebating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [winningAnswer, setWinningAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([...elders].sort((a, b) => b.points - a.points));
  const debateContainerRef = useRef(null);

  // Mock function to simulate debate streaming (will be replaced with OpenAI API)
  const startDebate = async () => {
    if (!question.trim()) {
      alert('Please enter a question for the council');
      return;
    }

    // Reset debate state
    setDebateMessages([]);
    setShowResults(false);
    setWinningAnswer(null);
    setIsDebating(true);

    // Randomly select 9 elders
    const shuffled = [...eldersList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 9);
    setSelectedElders(selected);

    // Display system message
    setDebateMessages([{
      type: 'system',
      content: `The Council convenes to discuss: "${question}"`,
      timestamp: new Date()
    }]);

    // TODO: Replace with actual OpenAI API call
    // For now, using mock data to demonstrate the UI
    setTimeout(() => {
      simulateMockDebate(selected);
    }, 1000);
  };

  // Mock debate simulation (to be replaced with OpenAI streaming)
  const simulateMockDebate = (elders) => {
    const mockResponses = [
      { elder: elders[0], message: "I believe we should take a bold approach here..." },
      { elder: elders[1], message: "That seems risky. Let me offer a different perspective..." },
      { elder: elders[2], message: "Both of you are missing the key point..." },
      { elder: elders[3], message: "I agree with the first point, but we need to consider..." },
      { elder: elders[4], message: "This reminds me of a similar situation where..." },
      { elder: elders[5], message: "We're overcomplicating this. The simple answer is..." },
      { elder: elders[6], message: "I strongly disagree. The evidence suggests..." },
      { elder: elders[7], message: "Let's find middle ground here..." },
      { elder: elders[8], message: "After hearing everyone, my final position is..." }
    ];

    // Simulate streaming messages
    mockResponses.forEach((response, index) => {
      setTimeout(() => {
        addDebateMessage(response.elder, response.message);
        
        // After all messages, show voting results
        if (index === mockResponses.length - 1) {
          setTimeout(() => {
            concludeDebate(elders);
          }, 2000);
        }
      }, (index + 1) * 2000);
    });
  };

  // Add a message to the debate
  const addDebateMessage = (elder, message) => {
    setDebateMessages(prev => [...prev, {
      type: 'elder',
      elder: elder,
      content: message,
      timestamp: new Date()
    }]);
  };

  // Conclude debate with voting
  const concludeDebate = (participatingElders) => {
    // Simulate voting (to be replaced with AI logic)
    const winner = participatingElders[Math.floor(Math.random() * participatingElders.length)];
    
    setDebateMessages(prev => [...prev, {
      type: 'system',
      content: `The Council has reached a decision. The winning argument comes from ${winner.name}.`,
      timestamp: new Date()
    }]);

    // Update points
    setEldersList(prev => prev.map(elder => 
      elder.id === winner.id ? { ...elder, points: elder.points + 1 } : elder
    ));

    // Update leaderboard
    setLeaderboard(prev => {
      const updated = prev.map(elder => 
        elder.id === winner.id ? { ...elder, points: elder.points + 1 } : elder
      );
      return updated.sort((a, b) => b.points - a.points);
    });

    setWinningAnswer(winner);
    setShowResults(true);
    setIsDebating(false);
  };

  // Auto-scroll debate container
  useEffect(() => {
    if (debateContainerRef.current) {
      debateContainerRef.current.scrollTop = debateContainerRef.current.scrollHeight;
    }
  }, [debateMessages]);

  // Handle Enter key submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDebating) {
      e.preventDefault();
      startDebate();
    }
  };

  return (
    <div className="council-container">
      {/* Left Panel - Elders Table */}
      <div className="elders-panel">
        <h2>The Council of Elders</h2>
        <div className="elders-table-container">
          <table className="elders-table">
            <thead>
              <tr>
                <th>Elder</th>
                <th>Personality</th>
              </tr>
            </thead>
            <tbody>
              {eldersList.map(elder => (
                <tr key={elder.id} className={selectedElders.includes(elder) ? 'selected' : ''}>
                  <td className="elder-name">{elder.name}</td>
                  <td className="elder-description">{elder.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Center Panel - Question Input and Debate Display */}
      <div className="debate-panel">
        <h2>Council Debate Chamber</h2>
        
        {/* Question Input */}
        <div className="question-input-container">
          <textarea
            className="question-input"
            placeholder="Ask the Council of Elders your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isDebating}
            rows="3"
          />
          <button 
            className="submit-button"
            onClick={startDebate}
            disabled={isDebating || !question.trim()}
          >
            {isDebating ? 'Debate in Progress...' : 'Submit to Council'}
          </button>
        </div>

        {/* Debate Display */}
        <div className="debate-container" ref={debateContainerRef}>
          {debateMessages.length === 0 && (
            <div className="debate-placeholder">
              The council awaits your question...
            </div>
          )}
          
          {debateMessages.map((msg, index) => (
            <div key={index} className={`debate-message ${msg.type}`}>
              {msg.type === 'elder' && (
                <>
                  <div className="elder-avatar">
                    {msg.elder.name.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="message-content">
                    <div className="elder-name-label">{msg.elder.name}</div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                </>
              )}
              {msg.type === 'system' && (
                <div className="system-message">{msg.content}</div>
              )}
            </div>
          ))}

          {showResults && winningAnswer && (
            <div className="debate-results">
              <h3>Council Decision</h3>
              <p>The winning argument was presented by <strong>{winningAnswer.name}</strong></p>
              <p>They have been awarded 1 point in the standings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Leaderboard */}
      <div className="leaderboard-panel">
        <h2>Elder Standings</h2>
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Elder</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 15).map((elder, index) => (
                <tr key={elder.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                  <td className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </td>
                  <td className="leader-name">{elder.name}</td>
                  <td className="points">{elder.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length > 15 && (
            <div className="leaderboard-more">
              ... and {leaderboard.length - 15} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouncilOfElders;