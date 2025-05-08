import { NextRequest, NextResponse } from 'next/server';
import { mcp_youtube_getVideoEngagementRatio, VideoEngagement } from '@/lib/mcp';
import { getVideoEngagementRatio } from '@/lib/youtube-api';

// Define interface for the YouTube API engagement response
interface YouTubeEngagementData {
  videoId: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  engagementRatio: string;
}

export async function POST(req: NextRequest) {
  try {
    const { videoIds } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: 'Video IDs array is required' }, { status: 400 });
    }

    try {
      // First try MCP function
      console.log('Trying MCP for video engagement...');
      const result = await mcp_youtube_getVideoEngagementRatio({ videoIds });
      
      // Format the response
      const formattedData = {
        items: result.map((engagement: VideoEngagement) => ({
          id: engagement.id,
          statistics: {
            viewCount: engagement.viewCount,
            likeCount: engagement.likeCount,
            commentCount: engagement.commentCount,
            engagementRatio: engagement.engagementRatio.toFixed(5)
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    } catch (mcpError: unknown) {
      console.error('Error using MCP for video engagement:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // Use YouTube API
    console.log('Using YouTube API for video engagement');
    const engagementData = await getVideoEngagementRatio({ videoIds });
    
    if (engagementData && engagementData.length > 0) {
      // Format the response
      const formattedData = {
        items: engagementData.map((engagement: YouTubeEngagementData) => ({
          id: engagement.videoId,
          statistics: {
            viewCount: engagement.viewCount,
            likeCount: engagement.likeCount,
            commentCount: engagement.commentCount,
            engagementRatio: engagement.engagementRatio
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    }
    
    return NextResponse.json({ error: 'Failed to fetch video engagement data from YouTube API' }, { status: 500 });
  } catch (error) {
    console.error('Error in video engagement API:', error);
    return NextResponse.json({ error: 'Failed to process video engagement request' }, { status: 500 });
  }
} 