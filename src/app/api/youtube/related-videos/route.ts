import { NextRequest, NextResponse } from 'next/server';
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

    // Use YouTube API directly
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
    } else {
      // Return empty items with a message
      return NextResponse.json({ 
        items: [],
        message: 'No related videos found. YouTube API may be experiencing issues or quota limits.'
      });
    }
  } catch (error) {
    console.error('Error in related videos API:', error);
    return NextResponse.json({ 
      error: 'Failed to process related videos request',
      items: []
    }, { status: 500 });
  }
} 