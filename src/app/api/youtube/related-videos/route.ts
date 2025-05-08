import { NextRequest, NextResponse } from 'next/server';
import { mcp_youtube_getRelatedVideos, RelatedVideo } from '@/lib/mcp';
import { getRelatedVideos } from '@/lib/youtube-api';

// Define interface for the API response from YouTube API
interface YouTubeRelatedVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const { videoId, maxResults = 5 } = await req.json();
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    try {
      // First try MCP function
      console.log('Trying MCP for related videos...');
      const result = await mcp_youtube_getRelatedVideos({ 
        videoId, 
        maxResults: Number(maxResults) 
      });
      
      // Format the response to match our expected structure
      const formattedData = {
        items: result.map((video: RelatedVideo) => ({
          id: { videoId: video.id },
          snippet: {
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnails: {
              medium: { url: video.thumbnailUrl }
            }
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    } catch (mcpError: unknown) {
      console.error('Error using MCP for related videos:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // Use YouTube API
    console.log('Using YouTube API for related videos');
    const relatedVideos = await getRelatedVideos({
      videoId,
      maxResults: Number(maxResults)
    });
    
    if (relatedVideos && relatedVideos.length > 0) {
      // Format the response to match our expected structure
      const formattedData = {
        items: relatedVideos.map((video: YouTubeRelatedVideo) => ({
          id: { videoId: video.id },
          snippet: {
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnails: {
              medium: { url: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` }
            }
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    }
    
    return NextResponse.json({ error: 'Failed to fetch related videos from YouTube API' }, { status: 500 });
  } catch (error) {
    console.error('Error in related videos API:', error);
    return NextResponse.json({ error: 'Failed to process related videos request' }, { status: 500 });
  }
} 