# YouTube Analytics

A modern YouTube Analytics application that demonstrates real-time YouTube data integration with fallback mechanisms.

## Features

- View trending YouTube videos
- Search for videos
- See detailed video metrics and statistics
- View related videos and engagement metrics
- Responsive design with Tailwind CSS

## Data Sources

This application uses a three-tier approach for fetching YouTube data:

1. **Cursor MCP YouTube Tools** (when running in Cursor)
   - Uses Cursor's Multi-Call Protocol (MCP) YouTube tools to access real-time YouTube data
   - Only available when running in the Cursor environment

2. **YouTube Data API v3** (for online deployment)
   - Uses the official YouTube Data API for production deployment
   - Requires an API key from Google Cloud Platform
   - See [SETUP_API.md](SETUP_API.md) for setup instructions

3. **Mock Data** (fallback)
   - Falls back to mock data if neither MCP nor the YouTube API are available
   - Ensures the application always displays something meaningful

## Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables

Create a `.env.local` file with:

```
YOUTUBE_API_KEY=YOUR_API_KEY_HERE
```

## Testing MCP YouTube Tools

The repository includes two testing tools:

1. `test-mcp.js`: A Node.js script to test MCP availability
2. `test-mcp.html`: A browser-based test page to check for MCP functions and make test calls

## Deployment

When deploying online, you must provide a YouTube API key as an environment variable. The application will automatically use this key when MCP tools are not available.

## Technologies

- Next.js 15.3.2
- React 19
- Tailwind CSS
- TypeScript

## License

MIT
