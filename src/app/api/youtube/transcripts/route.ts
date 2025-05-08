import { NextRequest, NextResponse } from 'next/server';
import { mcp_youtube_getTranscripts } from '@/lib/mcp';
import { getVideoTranscripts } from '@/lib/youtube-api';

export async function POST(req: NextRequest) {
  try {
    const { videoIds, lang = 'en' } = await req.json();
    
    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: 'Video IDs array is required' }, { status: 400 });
    }

    try {
      // First try MCP function
      console.log('Trying MCP for transcripts...');
      const result = await mcp_youtube_getTranscripts({ videoIds, lang });
      return NextResponse.json(result);
    } catch (mcpError: unknown) {
      console.error('Error using MCP for transcripts:', mcpError);
      // Continue to YouTube API fallback
    }
    
    // Use YouTube API with youtube-transcript library
    console.log('Using external transcript service...');
    const transcriptData = await getVideoTranscripts({ videoIds, lang });
    
    // Check if we got a valid response
    if (transcriptData && transcriptData.transcripts && !transcriptData.error) {
      return NextResponse.json(transcriptData);
    }
    
    // If we get here, we couldn't get transcripts from either method
    return NextResponse.json({ 
      error: transcriptData.error || "Failed to retrieve transcripts from any available source",
      transcripts: {}
    }, { status: 404 });
  } catch (error) {
    console.error('Error in video transcripts API:', error);
    
    // Check if the error is related to missing API key
    if (error instanceof Error && error.message.includes('No YouTube API key provided')) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured. Please follow the instructions in API_SETUP.md to set up your API key.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to process transcript request",
      transcripts: {}
    }, { status: 500 });
  }
} 