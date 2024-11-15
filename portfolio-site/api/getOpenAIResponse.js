// getOpenAiResponse.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userInput } = req.body;
    console.log("User input:", userInput);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          messages: [
            { role: 'system', content: 'You are a factual assistant providing answers about Vincenzo, if you do not know the answer, do not provide one.' },
            { role: 'user', content: userInput },
          ],
          model: 'ft:gpt-4o-2024-08-06:personal:me-v3:ATXTckgl',
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_KEY}`, // Store key in environment variables on your host
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("OpenAI response:", response.data);
      res.status(200).json({ result: response.data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
