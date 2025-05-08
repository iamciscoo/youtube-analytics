import { NextRequest, NextResponse } from 'next/server';
import { getVideoDetails } from '@/lib/youtube-api';

// Define a flexible type for YouTube video details
interface YouTubeVideo {
  id?: string;
  title?: string;
  channelTitle?: string;
  channelId?: string;
  description?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    channelId?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// Define a type for the global MCP function
type McpYouTubeGetVideoDetails = (params: { 
  videoIds: string[] 
}) => Promise<YouTubeVideo[]>;

export async function POST(req: NextRequest) {
  try {
    const { videoIds } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: 'Video IDs array is required' }, { status: 400 });
    }

    console.log('Fetching video details for:', videoIds);
    
    try {
      // 1. First try MCP function 
      const mcpFunction = (globalThis as unknown as { 
        mcp_youtube_getVideoDetails: McpYouTubeGetVideoDetails 
      }).mcp_youtube_getVideoDetails;
      
      if (typeof mcpFunction === 'function') {
        const videos = await mcpFunction({ videoIds });
        
        if (videos && videos.length > 0) {
          // Format the response to match our expected structure
          const formattedItems = videos.map((video) => ({
            id: video.id,
            snippet: {
              title: video.title || video.snippet?.title || '',
              channelTitle: video.channelTitle || video.snippet?.channelTitle || '',
              channelId: video.channelId || video.snippet?.channelId || '',
              description: video.description || video.snippet?.description || '',
              publishedAt: video.publishedAt || video.snippet?.publishedAt || '',
              thumbnails: {
                medium: { 
                  url: video.thumbnailUrl || video.snippet?.thumbnails?.medium?.url || 
                       (video.id ? `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` : '')
                }
              }
            },
            statistics: {
              viewCount: video.viewCount || video.statistics?.viewCount || '0',
              likeCount: video.likeCount || video.statistics?.likeCount || '0',
              commentCount: video.commentCount || video.statistics?.commentCount || '0'
            }
          }));
          
          return NextResponse.json({ items: formattedItems });
        }
      }
    } catch (mcpError) {
      console.error('MCP tool error:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // 2. Use YouTube API if MCP fails
    try {
      console.log('Using YouTube API for video details');
      const detailsData = await getVideoDetails({ videoIds });
      
      // Return the items whether empty or not
      if (detailsData && detailsData.length > 0) {
        // These items are already in the YouTube API format, just return them
        return NextResponse.json({ items: detailsData });
      } else {
        // Return empty items with a message
        return NextResponse.json({ 
          items: [],
          message: 'No video details available. YouTube API may be experiencing issues or quota limits.' 
        });
      }
    } catch (youtubeError) {
      console.error('YouTube API error:', youtubeError);
      
      // Check for quota exceeded or other API errors
      if (youtubeError instanceof Error) {
        const errorMessage = youtubeError.message;
        
        if (errorMessage.includes('403')) {
          return NextResponse.json({ 
            error: 'YouTube API quota exceeded or access denied. Please try again later.',
            quotaExceeded: true,
            items: [] // Always include items array, even when empty
          }, { status: 403 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch video details from YouTube API. The service may be temporarily unavailable.',
        items: [] // Always include items array, even when empty
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in video details API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to process video details request' }, { status: 500 });
  }
} 