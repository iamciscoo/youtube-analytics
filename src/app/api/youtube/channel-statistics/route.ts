import { NextRequest, NextResponse } from 'next/server';
import { mcp_youtube_getChannelStatistics, ChannelStatistics } from '@/lib/mcp';
import { getChannelStatistics } from '@/lib/youtube-api';

// Define interface for the YouTube API response
interface YouTubeChannelStatistics {
  id: string;
  title: string;
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
}

export async function POST(req: NextRequest) {
  try {
    const { channelIds } = await req.json();
    
    if (!channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({ error: 'Channel IDs array is required' }, { status: 400 });
    }

    try {
      // First try MCP function
      console.log('Trying MCP for channel statistics...');
      const result = await mcp_youtube_getChannelStatistics({ channelIds });
      
      // Format the response to match our expected structure
      const formattedData = {
        items: result.map((channel: ChannelStatistics) => ({
          id: channel.id,
          snippet: {
            title: channel.title
          },
          statistics: {
            viewCount: channel.viewCount,
            subscriberCount: channel.subscriberCount,
            videoCount: channel.videoCount
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    } catch (mcpError: unknown) {
      console.error('Error using MCP for channel statistics:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // Use YouTube API
    console.log('Using YouTube API for channel statistics');
    const channelStats = await getChannelStatistics({ channelIds });
    
    if (channelStats && channelStats.length > 0) {
      // Format the response
      const formattedData = {
        items: channelStats.map((channel: YouTubeChannelStatistics) => ({
          id: channel.id,
          snippet: {
            title: channel.title
          },
          statistics: {
            viewCount: channel.viewCount,
            subscriberCount: channel.subscriberCount,
            videoCount: channel.videoCount
          }
        }))
      };
      
      return NextResponse.json(formattedData);
    }
    
    return NextResponse.json({ error: 'Failed to fetch channel statistics from YouTube API' }, { status: 500 });
  } catch (error) {
    console.error('Error in channel statistics API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to process channel statistics request' }, { status: 500 });
  }
} 