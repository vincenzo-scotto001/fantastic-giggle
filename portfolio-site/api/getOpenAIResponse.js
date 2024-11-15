import axios from 'axios';

export default async function handler(req, res) {
  // Method validation
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Input validation
  const { userInput } = req.body;
  if (!userInput?.trim()) {
    return res.status(400).json({ error: 'User input is required' });
  }

  // API key validation
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        messages: [
          { 
            role: 'system', 
            content: 'You are a factual assistant providing answers about Vincenzo, if you do not know the answer, do not provide one.' 
          },
          { role: 'user', content: userInput },
        ],
        model: 'ft:gpt-4o-2024-08-06:personal:me-v3:ATXTckgl',
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate response structure
    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', response.data);
      return res.status(500).json({ error: 'Invalid API response structure' });
    }

    return res.status(200).json({ 
      result: response.data.choices[0].message.content,
      usage: response.data.usage // Optional: Include token usage info
    });

  } catch (error) {
    // Detailed error handling
    console.error('OpenAI API Error:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Failed to fetch response';

    return res.status(statusCode).json({ 
      error: errorMessage,
      type: error.response?.data?.error?.type || 'unknown'
    });
  }
}