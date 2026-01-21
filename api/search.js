// Vercel Serverless Function - Proxy for Perplexity API
export const config = {
    // Vercel only supports these runtime values: 'nodejs' or 'edge'
    runtime: 'nodejs'
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        console.error('PERPLEXITY_API_KEY not configured');
        return res.status(500).json({ error: 'Server is missing PERPLEXITY_API_KEY' });
    }

    try {
        const { messages, model, temperature } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid request: messages must be a non-empty array' });
        }

        // Make request to Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'sonar-pro',
                messages,
                temperature: temperature || 0.2
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Perplexity API error:', errorData);
            return res.status(response.status).json({
                error: errorData.error?.message || 'API request failed'
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
