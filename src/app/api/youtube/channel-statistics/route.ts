import { NextRequest, NextResponse } from 'next/server';
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

    // Use YouTube API directly
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
    } else {
      // Return empty items with a message
      return NextResponse.json({ 
        items: [],
        message: 'No channel statistics found. YouTube API may be experiencing issues or quota limits.'
      });
    }
  } catch (error) {
    console.error('Error in channel statistics API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.',
        items: []
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to process channel statistics request',
      items: []
    }, { status: 500 });
  }
} 