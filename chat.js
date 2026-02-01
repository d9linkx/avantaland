export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("Server Error: OPENAI_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request body: messages array required.' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || 'OpenAI API Error' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Handler Execution Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}