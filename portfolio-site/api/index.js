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
    const { userInput } = req.body;
        // Check if userInput is empty
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};