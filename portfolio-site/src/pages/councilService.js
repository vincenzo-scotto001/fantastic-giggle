// councilService.js - Service for handling Council of Elders debates with OpenAI

class CouncilDebateService {
  constructor() {
    // Support both possible environment variable names
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';

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

  // Stream a single elder's response
  async streamElderResponse(elder, question, debateContext, onChunk) {
    const messages = [
      {
        role: 'system',
        content: this.getElderPersonality(elder)
      },
      {
        role: 'user',
        content: `${debateContext}
        
        As ${elder.name}, provide your perspective on this question. 
        Remember to stay in character and keep your response to 2-3 sentences.`
      }
    ];

    try {

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}` // Fixed: Added "Bearer " prefix
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: messages,
          stream: true,
          temperature: 0.8,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error for elder response:', errorData);
        throw new Error(errorData.error?.message || 'API call failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                onChunk(content); // Stream each chunk to the UI
              }
            } catch (e) {
              // Skip parse errors for incomplete chunks
              continue;
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error(`Error streaming response for ${elder.name}:`, error);
      // Return a fallback response
      return `As ${elder.name}, I believe we need to carefully consider all aspects of this question.`;
    }
  }

  // Orchestrate the full debate
  async orchestrateDebate(question, selectedElders, callbacks) {
    const { onElderSpeak, onSystemMessage, onDebateComplete } = callbacks;
    const debateMessages = [];
    const speakingOrder = this.determineSpeakingOrder(selectedElders);
    
    // Initial system message
    onSystemMessage(`The Council convenes to discuss: "${question}"`);

    // Each elder speaks in turn
    for (let round = 0; round < 2; round++) { // 2 rounds of discussion
      for (const elder of speakingOrder) {
        const context = this.createDebateContext(question, selectedElders, debateMessages);
        
        let currentMessage = '';
        const response = await this.streamElderResponse(
          elder,
          question,
          context,
          (chunk) => {
            currentMessage += chunk;
            onElderSpeak(elder, currentMessage, false); // false = still streaming
          }
        );

        debateMessages.push({ elder: elder.name, content: response });
        onElderSpeak(elder, response, true); // true = message complete
        
        // Add delay between speakers for realism
        await this.delay(1500);
      }
    }

    // Conduct voting
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

  // Conduct voting among elders
  async conductVoting(question, elders, debateMessages) {
    const votingPrompt = `
      Based on the debate about "${question}", which elder provided the most compelling answer?
      
      Debate summary:
      ${debateMessages.map(m => `${m.elder}: ${m.content}`).join('\n')}
      
      Analyze each elder's argument and determine which one presented the strongest case.
      Consider factors like logic, evidence, persuasiveness, and addressing the core question.
      
      Respond with a JSON object in this exact format:
      {
        "winner": "Elder Name",
        "votes": {
          "Elder Name": ["Supporting Elder 1", "Supporting Elder 2", ...],
          ...
        },
        "reasoning": "Brief explanation of why this elder won"
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an impartial judge analyzing a debate between council elders. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: votingPrompt
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      
      // Check if the API call was successful
      if (!response.ok) {
        console.error('Voting API error:', data);
        throw new Error(data.error?.message || 'Voting API call failed');
      }

      // Check if we got a valid response
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid voting response structure:', data);
        throw new Error('Invalid response from API');
      }

      let votingResult;
      try {
        // Strip markdown code blocks if present
        let content = data.choices[0].message.content;
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        votingResult = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse voting result:', data.choices[0].message.content);
        // Fallback to selecting a random winner
        throw new Error('Could not parse voting result');
      }
      
      // Ensure we have a valid winner
      if (!votingResult.winner) {
        votingResult.winner = elders[Math.floor(Math.random() * elders.length)].name;
        votingResult.reasoning = "The council reached a decision through deliberation.";
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

  // Generate a summary of the debate outcome
  async generateDebateSummary(question, winner, reasoning) {
    const summaryPrompt = `
      Summarize the Council of Elders' decision on the question: "${question}"
      
      The winning perspective came from ${winner}.
      Reasoning: ${reasoning}
      
      Provide a 2-3 sentence summary of the council's final answer to the question,
      written from the perspective of ${winner}.
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: summaryPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Summary API error:', errorData);
        return `The council has spoken. ${winner} presented the winning argument.`;
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      return `The council has spoken. ${winner} presented the winning argument.`;
    } catch (error) {
      console.error('Error generating summary:', error);
      return `The council has spoken. ${winner} presented the winning argument.`;
    }
  }
}

export default CouncilDebateService;