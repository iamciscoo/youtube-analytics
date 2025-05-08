import { NextRequest, NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube-api';

// Define a flexible type for the different possible formats of YouTube video data
interface YouTubeVideo {
  id?: string | { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    description?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
  };
  title?: string;
  channelTitle?: string;
  description?: string;
  thumbnailUrl?: string;
}

// Define a type for the global MCP function
type McpYouTubeSearchVideos = (params: { query: string; maxResults?: number }) => Promise<YouTubeVideo[]>;

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 10 } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Searching videos with query:', query);
    
    try {
      // 1. First try MCP function
      const mcpFunction = (globalThis as unknown as { 
        mcp_youtube_searchVideos: McpYouTubeSearchVideos 
      }).mcp_youtube_searchVideos;
      
      if (typeof mcpFunction === 'function') {
        const videos = await mcpFunction({ 
          query, 
          maxResults: Number(maxResults) 
        });
        
        if (videos && videos.length > 0) {
          // Format the response to match our expected structure
          const formattedItems = videos.map((video: YouTubeVideo) => {
            // Different MCP tools might return different structures, handle both formats
            let videoId = '';
            
            if (typeof video.id === 'string') {
              videoId = video.id;
            } else if (video.id && typeof video.id === 'object') {
              videoId = video.id.videoId || '';
            }
            
            return {
              id: { videoId },
              snippet: {
                title: video.snippet?.title || video.title || '',
                channelTitle: video.snippet?.channelTitle || video.channelTitle || '',
                description: video.snippet?.description || video.description || '',
                thumbnails: {
                  medium: { 
                    url: video.snippet?.thumbnails?.medium?.url || video.thumbnailUrl || ''
                  }
                }
              }
            };
          });
          
          return NextResponse.json({ items: formattedItems });
        }
      } else {
        throw new Error('MCP search function not available');
      }
    } catch (mcpError) {
      console.error('MCP tool error:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // 2. Use YouTube API if MCP fails
    console.log('Using YouTube API for search');
    const searchResults = await searchVideos({
      query,
      maxResults: Number(maxResults)
    });
    
    if (searchResults && searchResults.length > 0) {
      // The data is already in the expected format from the YouTube API
      return NextResponse.json({ items: searchResults });
    }
    
    return NextResponse.json({ error: 'No search results found or failed to fetch from YouTube API' }, { status: 404 });
  } catch (error) {
    console.error('Error in search API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to process search request' }, { status: 500 });
  }
} 