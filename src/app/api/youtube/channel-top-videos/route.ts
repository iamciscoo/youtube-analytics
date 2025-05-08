import { NextRequest, NextResponse } from 'next/server';
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

    // Use YouTube API directly
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
    } else {
      // Return empty items with a message when no videos are found
      return NextResponse.json({ 
        items: [],
        message: 'No channel videos found. YouTube API may be experiencing issues or quota limits.'
      });
    }
  } catch (error) {
    console.error('Error in channel top videos API:', error);
    return NextResponse.json({ 
      error: 'Failed to process channel top videos request',
      items: []
    }, { status: 500 });
  }
} 