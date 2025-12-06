const axios = require('axios');

// API endpoint for Council of Elders debates
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { action, data } = req.body;

    try {
      switch (action) {
        case 'elderResponse':
          return await handleElderResponse(data, res);
        case 'voting':
          return await handleVoting(data, res);
        case 'summary':
          return await handleSummary(data, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Council API Error:', error);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Handle elder response generation
async function handleElderResponse(data, res) {
  const { elder, question, debateContext } = data;
  
  const messages = [
    {
      role: 'system',
      content: `You are ${elder.name}, with the following personality: ${elder.description}. 
      Respond to questions in character, maintaining this personality throughout the debate.
      Keep responses concise (2-3 sentences max) and engage with other elders' points.`
    },
    {
      role: 'user',
      content: `${debateContext}
      
      As ${elder.name}, provide your perspective on this question. 
      Remember to stay in character and keep your response to 2-3 sentences.`
    }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Using a more cost-effective model
        messages: messages,
        temperature: 0.8,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const elderResponse = response.data.choices[0].message.content;
    res.status(200).json({ response: elderResponse });
  } catch (error) {
    console.error('Error generating elder response:', error.response?.data || error.message);
    // Fallback response
    res.status(200).json({ 
      response: `As ${elder.name}, I believe we need to carefully consider all aspects of this question.`
    });
  }
}

// Handle voting logic
async function handleVoting(data, res) {
  const { question, elders, debateMessages } = data;
  
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
        "Elder Name": ["Supporting Elder 1", "Supporting Elder 2"],
      },
      "reasoning": "Brief explanation of why this elder won"
    }
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
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
        temperature: 0.3,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let votingResult;
    try {
      const content = response.data.choices[0].message.content;
      votingResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse voting result');
      // Fallback to random selection
      const randomWinner = elders[Math.floor(Math.random() * elders.length)];
      votingResult = {
        winner: randomWinner.name,
        reasoning: "The council reached a decision through deliberation.",
        votes: {}
      };
    }

    // Ensure we have a valid winner
    if (!votingResult.winner) {
      votingResult.winner = elders[Math.floor(Math.random() * elders.length)].name;
      votingResult.reasoning = "The council reached a decision through deliberation.";
    }

    res.status(200).json(votingResult);
  } catch (error) {
    console.error('Error conducting voting:', error.response?.data || error.message);
    // Fallback to random selection
    const randomWinner = elders[Math.floor(Math.random() * elders.length)];
    res.status(200).json({
      winner: randomWinner.name,
      reasoning: "The council reached a decision through deliberation.",
      votes: {}
    });
  }
}

// Handle summary generation
async function handleSummary(data, res) {
  const { question, winner, reasoning } = data;
  
  const summaryPrompt = `
    Summarize the Council of Elders' decision on the question: "${question}"
    
    The winning perspective came from ${winner}.
    Reasoning: ${reasoning}
    
    Provide a 2-3 sentence summary of the council's final answer to the question,
    written from the perspective of ${winner}.
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const summary = response.data.choices[0].message.content;
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error.response?.data || error.message);
    res.status(200).json({ 
      summary: `The council has spoken. ${winner} presented the winning argument.`
    });
  }
}