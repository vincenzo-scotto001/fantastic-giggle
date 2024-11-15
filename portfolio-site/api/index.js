const axios = require('axios');

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
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.status(200).json({ result: response.data.choices[0].message.content });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch response' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};