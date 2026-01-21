// Vercel Serverless Function - Proxy for Perplexity API
export const config = {
    // Vercel only supports these runtime values: 'nodejs' or 'edge'
    runtime: 'nodejs'
};

function asErrorMessage(err) {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    return err.message || 'Unknown error';
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Method not allowed' } });
    }

    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        console.error('PERPLEXITY_API_KEY not configured');
        return res.status(500).json({ error: { message: 'Server is missing PERPLEXITY_API_KEY' } });
    }

    try {
        const { messages, model, temperature } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: { message: 'Invalid request: messages must be a non-empty array' } });
        }

        // Make request to Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'jobhunter-vercel-function'
            },
            body: JSON.stringify({
                model: model || 'sonar-pro',
                messages,
                temperature: temperature || 0.2
            })
        });

        const contentType = response.headers.get('content-type') || '';

        // If Perplexity returns HTML (or anything non-JSON), don't try to JSON parse it.
        const isJson = contentType.toLowerCase().includes('application/json');

        if (!response.ok) {
            let upstreamMessage = `Perplexity request failed with status ${response.status}`;
            try {
                if (isJson) {
                    const errorData = await response.json();
                    upstreamMessage = errorData?.error?.message || upstreamMessage;
                } else {
                    const text = await response.text();
                    upstreamMessage = `${upstreamMessage} (non-JSON response: ${contentType || 'unknown content-type'})`;
                    console.error('Perplexity non-JSON error response (first 200 chars):', String(text).slice(0, 200));
                }
            } catch (e) {
                console.error('Failed to read Perplexity error body:', e);
            }

            console.error('Perplexity API error:', upstreamMessage);
            return res.status(response.status).json({ error: { message: upstreamMessage } });
        }

        if (!isJson) {
            const text = await response.text();
            console.error('Perplexity returned non-JSON success response (first 200 chars):', String(text).slice(0, 200));
            return res.status(502).json({
                error: { message: `Upstream returned non-JSON response (${contentType || 'unknown content-type'})` }
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: { message: 'Internal server error' },
            details: asErrorMessage(error)
        });
    }
}
