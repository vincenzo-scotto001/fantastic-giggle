import React, { useState, useEffect, useRef } from 'react';
import CouncilDebateService from '../pages/councilService';
import '../styles/CouncilOfElders.css';

const CouncilOfEldersWithAPI = () => {
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

  // Initialize debate service
  const [debateService] = useState(() => new CouncilDebateService());

  // State management
  const [eldersList, setEldersList] = useState(elders);
  const [question, setQuestion] = useState('');
  const [debateMessages, setDebateMessages] = useState([]);
  const [selectedElders, setSelectedElders] = useState([]);
  const [isDebating, setIsDebating] = useState(false);
  const [typingElder, setTypingElder] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [winningAnswer, setWinningAnswer] = useState(null);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [votingDetails, setVotingDetails] = useState(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  
  // Collapsible state
  const [eldersCollapsed, setEldersCollapsed] = useState(true);
  const [leaderboardCollapsed, setLeaderboardCollapsed] = useState(true);
  
  const debateContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Fetch leaderboard from Supabase on mount and after updates
  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const response = await fetch('/api?action=getLeaderboard');
      const data = await response.json();
      
      if (data.elders) {
        // Merge Supabase data with local elder definitions
        const mergedElders = eldersList.map(elder => {
          const supabaseElder = data.elders.find(e => e.id === elder.id);
          return {
            ...elder,
            points: supabaseElder ? supabaseElder.points : 0
          };
        });
        
        setEldersList(mergedElders);
        setLeaderboard(mergedElders.sort((a, b) => b.points - a.points));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([...eldersList].sort((a, b) => b.points - a.points));
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Fetch leaderboard on component mount
  useEffect(() => {
    fetchLeaderboard();
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update elder points in Supabase
  const updateElderPointsInSupabase = async (winner) => {
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePoints',
          data: {
            elderName: winner.name,
            elderId: winner.id
          }
        })
      });

      if (response.ok) {
        // Refresh leaderboard after updating points
        await fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error updating points in Supabase:', error);
    }
  };

  // Start debate with OpenAI integration
  const startDebate = async () => {
    if (!question.trim()) {
      alert('Please enter a question for the council');
      return;
    }

    // Reset debate state
    setDebateMessages([]);
    setShowResults(false);
    setWinningAnswer(null);
    setFinalAnswer('');
    setIsDebating(true);
    setElapsedTime(0);
    setTypingElder(null);

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Randomly select 9 elders
    const shuffled = [...eldersList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 9);
    setSelectedElders(selected);

    try {
      // Orchestrate the debate
      await debateService.orchestrateDebate(
        question,
        selected,
        {
          onElderTyping: (elder) => {
            setTypingElder(elder);
          },
          onElderSpeak: (elder, message) => {
            setTypingElder(null);
            setDebateMessages(prev => [...prev, {
              type: 'elder',
              elder: elder,
              content: message,
              timestamp: new Date()
            }]);
          },
          onSystemMessage: (message) => {
            setDebateMessages(prev => [...prev, {
              type: 'system',
              content: message,
              timestamp: new Date()
            }]);
          },
          onDebateComplete: async (votingResult) => {
            // Stop timer
            clearInterval(timerIntervalRef.current);
            
            // Store voting details
            setVotingDetails(votingResult);

            const winner = selected.find(e => e.name === votingResult.winner);
            if (winner) {
              // Update points in Supabase
              await updateElderPointsInSupabase(winner);

              // Generate final answer
              const summary = await debateService.generateDebateSummary(
                question, 
                winner.name, 
                votingResult.reasoning
              );
              
              setFinalAnswer(summary);
              setWinningAnswer(winner);
              setShowResults(true);
            }
            
            setIsDebating(false);
          }
        }
      );
    } catch (error) {
      console.error('Debate error:', error);
      alert('An error occurred during the debate. Please try again.');
      setIsDebating(false);
      setTypingElder(null);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Format elapsed time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll debate container
  useEffect(() => {
    if (debateContainerRef.current) {
      debateContainerRef.current.scrollTop = debateContainerRef.current.scrollHeight;
    }
  }, [debateMessages, typingElder]);

  // Handle Enter key submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDebating) {
      e.preventDefault();
      startDebate();
    }
  };

  return (
    <div className="council-container">
      {/* Collapsible Elders Panel */}
      <div className={`elders-panel ${eldersCollapsed ? 'collapsed' : ''}`}>
        <h2 onClick={() => setEldersCollapsed(!eldersCollapsed)}>
          The Council of Elders
        </h2>
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
                <tr key={elder.id} className={selectedElders.some(e => e.id === elder.id) ? 'selected' : ''}>
                  <td className="elder-name">{elder.name}</td>
                  <td className="elder-description">{elder.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Debate Panel */}
      <div className="debate-panel">
        <h2 className={isDebating ? 'debate-active' : ''}>
          Council Debate Chamber
          {isDebating && <span style={{ marginLeft: '10px', fontSize: '14px' }}>
            {formatTime(elapsedTime)}
          </span>}
        </h2>
        
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
          {debateMessages.length === 0 && !typingElder && (
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

          {/* Typing indicator */}
          {typingElder && (
            <div className="typing-indicator">
              <div className="elder-avatar">
                {typingElder.name.split(' ').map(word => word[0]).join('')}
              </div>
              <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          {/* Results display */}
          {showResults && winningAnswer && (
            <div className="debate-results">
              <h3>Council Decision</h3>
              <p>The winning argument was presented by <strong>{winningAnswer.name}</strong></p>
              {votingDetails && votingDetails.votes && votingDetails.votes[winningAnswer.name] && (
                <p className="voting-details">
                  Supported by: <strong>{votingDetails.votes[winningAnswer.name].join(', ')}</strong>
                </p>
              )}
              {finalAnswer && (
                <div className="final-answer">
                  <h4>Final Answer:</h4>
                  <p>{finalAnswer}</p>
                </div>
              )}
              <p className="points-awarded">+1 point awarded to {winningAnswer.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Leaderboard Panel */}
      <div className={`leaderboard-panel ${leaderboardCollapsed ? 'collapsed' : ''}`}>
        <h2 onClick={() => setLeaderboardCollapsed(!leaderboardCollapsed)}>
          Global Standings
          {!isLoadingLeaderboard && (
            <span style={{ fontSize: '12px', marginLeft: '10px', color: '#718096' }}>
              (Live)
            </span>
          )}
        </h2>
        <div className="leaderboard-container">
          {isLoadingLeaderboard ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
              Loading leaderboard...
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouncilOfEldersWithAPI;
