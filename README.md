# User Research Job Finder

A simple web application that helps you discover remote user research job opportunities across multiple job boards and career sites. Built with vanilla JavaScript and powered by Perplexity AI.

## Features

- Searches top job boards for remote user research positions
- Caches results in browser localStorage for quick access
- Clean, responsive interface
- Secure API key handling via serverless functions

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- API: Perplexity AI (Sonar Pro model)
- Deployment: Vercel (with Serverless Functions)

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd jobhunter
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Add your Perplexity API key to `.env`:
```
PERPLEXITY_API_KEY=your_actual_api_key_here
```

Get your API key from [Perplexity AI Settings](https://www.perplexity.ai/settings/api)

4. Install Vercel CLI (for local testing):
```bash
pnpm add -g vercel
```

5. Run the development server:
```bash
vercel dev
```

6. Open your browser to `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI if you haven't:
```bash
pnpm add -g vercel
```

2. Deploy:
```bash
vercel
```

Once the project is linked in Vercel, every `git push` to the branch Vercel is watching will trigger a new deploy automatically.

3. Follow the prompts to link to your Vercel account

4. Set the environment variable:
```bash
vercel env add PERPLEXITY_API_KEY
```
Paste your API key when prompted, and select "Production" environment.

5. Redeploy to apply the environment variable:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. In the project settings, add the environment variable:
   - Key: `PERPLEXITY_API_KEY`
   - Value: Your Perplexity API key
   - Environment: Production

6. Click "Deploy"

## Project Structure

```
jobhunter/
├── api/
│   └── search.js          # Serverless function (API proxy)
├── index.html             # Main application
├── config.example.js      # Example config (not used in production)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Security Notes

- The API key is **never** exposed to the client
- All API requests are proxied through a Vercel serverless function
- The `config.js` file is git-ignored and only used for reference
- Environment variables are managed securely via Vercel

## How It Works

1. User clicks "Find Jobs" button
2. Frontend sends a POST request to `/api/search`
3. Serverless function (`api/search.js`) adds the API key and forwards request to Perplexity AI
4. Perplexity AI searches for job boards with active listings
5. Results are returned to the frontend and cached in localStorage

## Customization

To modify the search query or parameters, edit the `content` field in the `searchJobs()` function in `index.html` (around line 354).

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for improvements.
