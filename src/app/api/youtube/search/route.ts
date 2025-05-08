import { NextRequest, NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube-api';

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 10 } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Searching videos with query:', query);
    
    // Use YouTube API directly
    console.log('Using YouTube API for search');
    const searchResults = await searchVideos({
      query,
      maxResults: Number(maxResults)
    });
    
    // Handle results whether empty or not
    if (searchResults && searchResults.length > 0) {
      // The data is already in the expected format from the YouTube API
      return NextResponse.json({ items: searchResults });
    } else {
      // Return empty items instead of an error
      return NextResponse.json({ 
        items: [], 
        message: 'No search results found. YouTube API may be experiencing issues or quota limits.'
      });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.',
        items: []
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to process search request',
      items: []
    }, { status: 500 });
  }
} 