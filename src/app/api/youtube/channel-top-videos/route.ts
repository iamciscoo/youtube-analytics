import { NextRequest, NextResponse } from 'next/server';
import { mcp_youtube_getChannelTopVideos, ChannelTopVideo } from '@/lib/mcp';
import { getChannelTopVideos } from '@/lib/youtube-api';

// Define interface for the YouTube API response
interface YouTubeChannelVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
}

export async function POST(req: NextRequest) {
  try {
    const { channelId, maxResults = 5 } = await req.json();
    
    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    try {
      // First try MCP function
      console.log('Trying MCP for channel top videos...');
      const result = await mcp_youtube_getChannelTopVideos({ 
        channelId, 
        maxResults: Number(maxResults) 
      });
      
      // Format the response to match our expected structure
      const formattedData = {
        items: result.map((video: ChannelTopVideo) => ({
          id: { videoId: video.id },
          snippet: {
            title: video.title,
            publishedAt: video.publishedAt,
            thumbnails: {
              medium: { url: video.thumbnailUrl }
            }
          },
          statistics: {
            viewCount: video.viewCount
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    } catch (mcpError: unknown) {
      console.error('Error using MCP for channel top videos:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // Use YouTube API
    console.log('Using YouTube API for channel top videos');
    const topVideos = await getChannelTopVideos({ 
      channelId, 
      maxResults: Number(maxResults) 
    });
    
    if (topVideos && topVideos.length > 0) {
      // Format the response
      const formattedData = {
        items: topVideos.map((video: YouTubeChannelVideo) => ({
          id: { videoId: video.id },
          snippet: {
            title: video.title,
            publishedAt: video.publishedAt,
            thumbnails: {
              medium: { url: video.thumbnailUrl }
            }
          },
          statistics: {
            viewCount: video.viewCount
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    }
    
    return NextResponse.json({ error: 'Failed to fetch channel top videos from YouTube API' }, { status: 500 });
  } catch (error) {
    console.error('Error in channel top videos API:', error);
    return NextResponse.json({ error: 'Failed to process channel top videos request' }, { status: 500 });
  }
} 