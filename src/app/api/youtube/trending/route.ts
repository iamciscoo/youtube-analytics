import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingVideos } from '@/lib/youtube-api';

// Define a flexible type for the different possible formats of YouTube video data
interface YouTubeVideo {
  id?: string;
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { regionCode = 'US', categoryId, maxResults = 12 } = await req.json();
    
    console.log('Fetching trending videos with params:', { regionCode, categoryId, maxResults });
    
    // Use YouTube API directly
    console.log('Using YouTube API for trending videos');
    const videos = await fetchTrendingVideos({
      regionCode,
      categoryId,
      maxResults: Number(maxResults)
    });
    
    // Format the response to match our expected structure
    const formattedItems = videos.map((video: YouTubeVideo) => {
      return {
        id: video.id || '',
        snippet: {
          title: video.snippet?.title || video.title || '',
          channelTitle: video.snippet?.channelTitle || video.channelTitle || '',
          publishedAt: video.snippet?.publishedAt || video.publishedAt || '',
          thumbnails: {
            medium: { 
              url: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`
            }
          }
        },
        statistics: {
          viewCount: video.statistics?.viewCount || video.viewCount || '0',
          likeCount: video.statistics?.likeCount || video.likeCount || '0'
        }
      };
    });
    
    // Return results whether empty or not
    if (videos.length > 0) {
      return NextResponse.json({ items: formattedItems });
    } else {
      return NextResponse.json({ 
        items: [], 
        message: 'No trending videos available. YouTube API may be experiencing issues or quota limits.'
      });
    }
  } catch (error) {
    console.error('Error in trending videos API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.',
        items: [] 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to process trending videos request',
      items: []
    }, { status: 500 });
  }
} 