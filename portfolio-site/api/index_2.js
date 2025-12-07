const axios = require('axios');
const { Pinecone } = require('@pinecone-database/pinecone');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// New function to log interactions to Supabase
async function logInteraction(question, answer, context) {
  try {
    const { error } = await supabase
      .from('Questions_and_Answers')
      .insert([
        { 
          Question: question,
          Answer: answer,
          Datetime: new Date().toISOString(),
          Context: context
        }
      ])
      .select();

      if (error) {
        console.error('Supabase Logging Error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          type: error.type          
        });
  
        // Additional diagnostic logging
        console.log('Supabase Connection Details:', {
          url: process.env.SUPABASE_URL ? 'Configured' : 'Missing',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing'
        });
      }
  } catch (error) {
    console.error('Database logging failed:', error);
  }
}

async function getContext(userInput) {
  try {
    // Get embedding from OpenAI using api
    const embeddingResponse = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: userInput,
        model: 'text-embedding-3-large',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embedding = embeddingResponse.data.data[0].embedding;

    // Query Pinecone using the new syntax
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });
    console.log('Matches with metadata:');
    queryResponse.matches.forEach((match, index) => {
      console.log(`Match ${index + 1}:`);
      console.log('Score:', match.score);
      console.log('Metadata:', match.metadata);
      console.log('------------------------'); 
    });
    return queryResponse.matches.map(match => match.metadata.text).join('\n\n');
  } catch (error) {
    console.error('Context retrieval error:', error);
    return ''; // Return empty context if retrieval fails
  }
}

// Council of Elders Functions
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
        model: 'gpt-4o-mini',
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
    res.status(200).json({ 
      response: `As ${elder.name}, I believe we need to carefully consider all aspects of this question.`
    });
  }
}

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
      const randomWinner = elders[Math.floor(Math.random() * elders.length)];
      votingResult = {
        winner: randomWinner.name,
        reasoning: "The council reached a decision through deliberation.",
        votes: {}
      };
    }

    if (!votingResult.winner) {
      votingResult.winner = elders[Math.floor(Math.random() * elders.length)].name;
      votingResult.reasoning = "The council reached a decision through deliberation.";
    }

    res.status(200).json(votingResult);
  } catch (error) {
    console.error('Error conducting voting:', error.response?.data || error.message);
    const randomWinner = elders[Math.floor(Math.random() * elders.length)];
    res.status(200).json({
      winner: randomWinner.name,
      reasoning: "The council reached a decision through deliberation.",
      votes: {}
    });
  }
}

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

// New Council Leaderboard Functions
async function getCouncilLeaderboard(res) {
  try {
    const { data, error } = await supabase
      .from('council_elders')
      .select('*')
      .order('points', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(200).json({ elders: [] });
    }

    res.status(200).json({ elders: data || [] });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(200).json({ elders: [] });
  }
}

async function updateElderPoints(data, res) {
  const { elderName, elderId } = data;
  
  try {
    // First, try to get the existing elder
    const { data: existingElder, error: fetchError } = await supabase
      .from('council_elders')
      .select('*')
      .eq('id', elderId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching elder:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch elder' });
    }

    if (existingElder) {
      // Update existing elder's points
      const { data: updatedElder, error: updateError } = await supabase
        .from('council_elders')
        .update({ 
          points: existingElder.points + 1,
          last_win: new Date().toISOString()
        })
        .eq('id', elderId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating elder points:', updateError);
        return res.status(500).json({ error: 'Failed to update points' });
      }

      res.status(200).json({ success: true, elder: updatedElder });
    } else {
      // Create new elder entry
      const { data: newElder, error: insertError } = await supabase
        .from('council_elders')
        .insert([
          { 
            id: elderId,
            name: elderName,
            points: 1,
            last_win: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating elder:', insertError);
        return res.status(500).json({ error: 'Failed to create elder' });
      }

      res.status(200).json({ success: true, elder: newElder });
    }
  } catch (error) {
    console.error('Error updating elder points:', error);
    res.status(500).json({ error: 'Failed to update points' });
  }
}

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
    const { action, userInput } = req.body;

    // Handle Council of Elders actions
    if (action) {
      switch (action) {
        case 'elderResponse':
          return await handleElderResponse(req.body.data, res);
        case 'voting':
          return await handleVoting(req.body.data, res);
        case 'summary':
          return await handleSummary(req.body.data, res);
        case 'updatePoints':
          return await updateElderPoints(req.body.data, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    }

    // Handle original CenzGPT functionality
    if (!userInput || userInput.trim() === '') {
      return res.status(400).json({ result: "Please type a question." });
    }

    try {
      // Get relevant context from Pinecone
      const context = await getContext(userInput);
      
      // Prepare the enhanced prompt
      const enhancedPrompt = context 
        ? `Context:\n${context}\n\nQuestion: ${userInput}`
        : "I'm sorry, I don't have enough information to answer that.";

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          messages: [
            { 
              role: 'system', 
              content: `
                You are an assistant that answers questions based strictly on the provided context.
                - If no context is provided or the question cannot be answered with the given context, respond with:
                  "I'm sorry, I don't have enough information to answer that."
                - Do not guess or use external information beyond the provided context.
                - Use a professional and clear tone. If necessary, explain concepts in a way that a high school student can understand.
              `
            },
            { role: 'user', content: enhancedPrompt },
          ],
          model: 'ft:gpt-4o-2024-08-06:personal:me-v3:ATXTckgl',
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const answerText = response.data.choices[0].message.content;

      // Log the interaction to Supabase
      await logInteraction(userInput, answerText, context);

      res.status(200).json({ result: answerText });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch response' });
    }
  } else if (req.method === 'GET') {
    // Handle GET requests for leaderboard
    if (req.url === '/api?action=getLeaderboard') {
      return await getCouncilLeaderboard(res);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};