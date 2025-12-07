// councilService.js - Service for handling Council of Elders debates with backend API

class CouncilDebateService {
  constructor() {
    // Use the API endpoint instead of direct OpenAI calls
    this.apiUrl = '/api/council';
  }

  // Generate elder personalities for the system prompt
  getElderPersonality(elder) {
    return `You are ${elder.name}, with the following personality: ${elder.description}. 
    Respond to questions in character, maintaining this personality throughout the debate.
    Keep responses concise (2-3 sentences max) and engage with other elders' points.`;
  }

  // Create the debate context
  createDebateContext(question, selectedElders, previousMessages = []) {
    const context = `
      A council of 9 elders is debating the following question: "${question}"
      
      The participating elders are:
      ${selectedElders.map(e => `- ${e.name}: ${e.description}`).join('\n')}
      
      Rules for the debate:
      1. Each elder should speak in character based on their personality
      2. Responses should be 2-3 sentences maximum
      3. Elders should respond to and build upon previous arguments
      4. The debate should work toward finding a consensus answer
      5. After sufficient discussion, elders should vote on the best answer
      
      Previous messages in this debate:
      ${previousMessages.map(m => `${m.elder}: ${m.content}`).join('\n')}
    `;

    return context;
  }

  // Get a single elder's response via API
  async getElderResponse(elder, question, debateContext) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'elderResponse',
          data: {
            elder,
            question,
            debateContext
          }
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error(`Error getting response for ${elder.name}:`, error);
      // Return a fallback response
      return `As ${elder.name}, I believe we need to carefully consider all aspects of this question.`;
    }
  }

  // Orchestrate the full debate
  async orchestrateDebate(question, selectedElders, callbacks) {
    const { onElderTyping, onElderSpeak, onSystemMessage, onDebateComplete } = callbacks;
    const debateMessages = [];
    const speakingOrder = this.determineSpeakingOrder(selectedElders);
    
    // Initial system message
    onSystemMessage(`The Council convenes to discuss: "${question}"`);
    await this.delay(1500);

    // Each elder speaks in turn
    for (let round = 0; round < 2; round++) { // 2 rounds of discussion
      for (const elder of speakingOrder) {
        // Show typing indicator
        onElderTyping(elder);
        
        // Add random typing delay (1.5-3 seconds) for realism
        const typingDelay = 1500 + Math.random() * 1500;
        await this.delay(typingDelay);
        
        // Get the elder's response from the API
        const context = this.createDebateContext(question, selectedElders, debateMessages);
        const response = await this.getElderResponse(elder, question, context);
        
        // Hide typing indicator and show complete message
        onElderSpeak(elder, response);
        debateMessages.push({ elder: elder.name, content: response });
        
        // Add delay between speakers for realism
        await this.delay(1000);
      }
    }

    // Conduct voting
    onSystemMessage(`The Council is deliberating...`);
    await this.delay(2000);
    
    const votingResult = await this.conductVoting(question, selectedElders, debateMessages);
    onSystemMessage(`The Council has reached a decision...`);
    
    await this.delay(1000);
    
    onDebateComplete(votingResult);
  }

  // Determine speaking order (can be randomized or based on personality)
  determineSpeakingOrder(elders) {
    // Shuffle for random order
    return [...elders].sort(() => Math.random() - 0.5);
  }

  // Conduct voting among elders via API
  async conductVoting(question, elders, debateMessages) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'voting',
          data: {
            question,
            elders,
            debateMessages
          }
        })
      });

      if (!response.ok) {
        throw new Error('Voting API call failed');
      }

      const votingResult = await response.json();
      
      // Ensure we have a valid winner
      if (!votingResult.winner) {
        const randomWinner = elders[Math.floor(Math.random() * elders.length)];
        return {
          winner: randomWinner.name,
          reasoning: "The council reached a decision through deliberation.",
          votes: {}
        };
      }

      return votingResult;
    } catch (error) {
      console.error('Error conducting voting:', error);
      // Fallback to random selection if voting fails
      const randomWinner = elders[Math.floor(Math.random() * elders.length)];
      return {
        winner: randomWinner.name,
        reasoning: "The council reached a decision through deliberation.",
        votes: {}
      };
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate a summary of the debate outcome via API
  async generateDebateSummary(question, winner, reasoning) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'summary',
          data: {
            question,
            winner,
            reasoning
          }
        })
      });

      if (!response.ok) {
        throw new Error('Summary API call failed');
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return `The council has spoken. ${winner} presented the winning argument.`;
    }
  }
}

export default CouncilDebateService;