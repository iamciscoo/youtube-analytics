import { YoutubeTranscript } from 'youtube-transcript';
import youtubeCaptionScraper from 'youtube-caption-scraper';

// YouTube API utilities
// Replace YOUTUBE_API_KEY with your actual API key when deploying
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// Check if API key is available
const isApiKeyAvailable = YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_API_KEY' && YOUTUBE_API_KEY.length > 0;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Validates that an API key is available
 * @throws {Error} If no valid API key is configured
 */
function validateApiKey() {
  if (!isApiKeyAvailable) {
    throw new Error('No YouTube API key provided. Set the YOUTUBE_API_KEY environment variable in .env.local');
  }
}

export async function fetchTrendingVideos(params: { 
  regionCode?: string;
  categoryId?: string;
  maxResults?: number;
}) {
  // Validate API key first
  validateApiKey();
  
  const { regionCode = 'US', categoryId, maxResults = 10 } = params;
  
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.append('part', 'snippet,statistics');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  if (categoryId) {
    url.searchParams.append('videoCategoryId', categoryId);
  }
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to format that matches our MCP response
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount
    }));
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw new Error('Failed to fetch trending videos from YouTube API');
  }
}

export async function searchVideos(params: {
  query: string;
  maxResults?: number;
}) {
  // Validate API key first
  validateApiKey();
  
  const { query, maxResults = 10 } = params;
  
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('q', query);
  url.searchParams.append('type', 'video');
  url.searchParams.append('maxResults', maxResults.toString());
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw new Error('Failed to search videos from YouTube API');
  }
}

export async function getVideoDetails(params: {
  videoIds: string[];
}) {
  // Validate API key first
  validateApiKey();
  
  const { videoIds } = params;
  
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.append('part', 'snippet,statistics,contentDetails');
  url.searchParams.append('id', videoIds.join(','));
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw new Error('Failed to fetch video details from YouTube API');
  }
}

export async function getRelatedVideos(params: {
  videoId: string;
  maxResults?: number;
}) {
  // Validate API key first
  validateApiKey();
  
  const { videoId, maxResults = 10 } = params;
  
  try {
    // YouTube's API has restricted the relatedToVideoId parameter in many regions
    // We'll use search with the video title as a workaround
    
    // First, get the video details to get its title
    const videoDetailsUrl = new URL(`${BASE_URL}/videos`);
    videoDetailsUrl.searchParams.append('part', 'snippet');
    videoDetailsUrl.searchParams.append('id', videoId);
    videoDetailsUrl.searchParams.append('key', YOUTUBE_API_KEY);
    
    const videoResponse = await fetch(videoDetailsUrl.toString());
    if (!videoResponse.ok) {
      throw new Error(`YouTube API error: ${videoResponse.status}`);
    }
    
    const videoData = await videoResponse.json();
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error(`Video not found: ${videoId}`);
    }
    
    // Extract key terms from the title for search
    const videoTitle = videoData.items[0].snippet.title;
    const searchTerms = videoTitle
      .split(' ')
      .filter((word: string) => word.length > 3)
      .slice(0, 3)
      .join(' ');
    
    // Now search for videos with similar terms
    const searchUrl = new URL(`${BASE_URL}/search`);
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchTerms);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('maxResults', maxResults.toString());
    searchUrl.searchParams.append('key', YOUTUBE_API_KEY);
    
    const searchResponse = await fetch(searchUrl.toString());
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // Filter out the original video from results
    const filteredItems = searchData.items.filter((item: any) => 
      item.id.videoId !== videoId
    );
    
    // Transform to format similar to our MCP response
    return filteredItems.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.medium.url
    }));
  } catch (error) {
    console.error('Error fetching related videos:', error);
    throw new Error('Failed to fetch related videos from YouTube API');
  }
}

/**
 * Helper function to properly scale timestamp values from YouTube transcripts
 * YouTube transcripts can have timestamps in various formats:
 * 1. Standard seconds: 10, 20, 30, etc.
 * 2. Fractional seconds that need scaling: 0.001, 0.005, etc. (actually 1s, 5s)
 * 3. Already scaled seconds: 1.5, 10.5, etc.
 */
function scaleTimestamp(value: number): number {
  if (value === 0) return 0;
  
  // If the value is extremely small (0-1), it's not seconds but a fraction of the video duration
  // These small values are actual time points in seconds
  if (value >= 0 && value < 1) {
    // For YouTube direct timestamps (0.58, 0.6, etc) in transcripts
    // These are actually direct seconds (e.g., 0.58 = 0 seconds)
    return Math.floor(value); // Take just the integer part (0.58 -> 0)
  } else if (value >= 1 && value < 100) {
    // For values like 3.2, 5.6, etc. which are actual second values
    return Math.floor(value); // Take just the integer part (3.2 -> 3)
  }
  
  // If value is extremely small (e.g., 0.001, 0.0044), it's likely
  // a direct time point that needs to be scaled up 
  if (value > 0 && value < 0.1) {
    // These very small values typically represent seconds
    // Multiply by 1000 to convert to proper seconds
    return Math.floor(value * 1000);
  }
  
  // Return the value directly if it's already a reasonable timestamp
  return Math.floor(value);
}

export async function getVideoTranscripts(params: {
  videoIds: string[];
  lang?: string;
}) {
  // Validate API key first - not strictly needed for transcripts but keeping for consistency
  validateApiKey();
  
  const { videoIds, lang = 'en' } = params;
  const transcripts: Record<string, { text: string; start: number; duration: number; }[]> = {};

  try {
    // Process each video ID sequentially to avoid timeout issues
    for (const videoId of videoIds) {
      try {
        // Try first method - youtube-caption-scraper
        try {
          const captions = await youtubeCaptionScraper.getSubtitles({
            videoID: videoId,
            lang: lang
          });
          
          if (captions && captions.length > 0) {
            // Format captions to match our expected structure and ensure numeric timestamps
            transcripts[videoId] = captions.map(caption => {
              const start = typeof caption.start === 'string' ? parseFloat(caption.start) : Number(caption.start) || 0;
              const duration = typeof caption.dur === 'string' ? parseFloat(caption.dur) : Number(caption.dur) || 0;
              
              return {
                text: caption.text,
                start: scaleTimestamp(start),
                duration
              };
            });
            
            console.log(`Successfully fetched transcript for ${videoId} using caption-scraper with ${transcripts[videoId].length} entries`);
            console.log('First few entries:', transcripts[videoId].slice(0, 3));
            continue; // Skip to next video if this method succeeded
          }
        } catch {
          console.log(`Caption-scraper method failed for ${videoId}, trying fallback method`);
        }
        
        // Fallback method - youtube-transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
        
        // Format transcript to match our expected structure and ensure numeric timestamps
        transcripts[videoId] = transcript.map(item => {
          let start = typeof item.offset === 'string' ? parseFloat(item.offset) / 1000 : Number(item.offset) / 1000 || 0;
          const duration = typeof item.duration === 'string' ? parseFloat(item.duration) / 1000 : Number(item.duration) / 1000 || 0;
          
          start = scaleTimestamp(start);
          
          return {
            text: item.text,
            start,
            duration
          };
        });
        
        console.log(`Successfully fetched transcript for ${videoId} using youtube-transcript with ${transcripts[videoId].length} entries`);
        console.log('First few entries:', transcripts[videoId].slice(0, 3));
      } catch (error) {
        console.error(`Error fetching transcript for video ${videoId}:`, error);
        
        // If we can't get transcript for this video, set an empty array
        transcripts[videoId] = [];
        
        // Try a direct web scraping approach as last resort for this video ID
        try {
          // This is a fallback method that makes a direct request to YouTube's transcript API
          const url = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const text = await response.text();
            if (text && text.length > 0) {
              // Very basic XML parsing for transcript data
              const matches = text.match(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g);
              
              if (matches && matches.length > 0) {
                transcripts[videoId] = matches.map(match => {
                  const startMatch = match.match(/start="([^"]+)"/);
                  const durMatch = match.match(/dur="([^"]+)"/);
                  const textMatch = match.match(/>([^<]+)</);
                  
                  let start = startMatch ? parseFloat(startMatch[1]) : 0;
                  const duration = durMatch ? parseFloat(durMatch[1]) : 0;
                  
                  start = scaleTimestamp(start);
                  
                  return {
                    text: textMatch ? decodeURIComponent(textMatch[1]) : '',
                    start: isNaN(start) ? 0 : start,
                    duration: isNaN(duration) ? 0 : duration
                  };
                });
                
                console.log(`Successfully fetched transcript for ${videoId} using direct API with ${transcripts[videoId].length} entries`);
                console.log('First few entries:', transcripts[videoId].slice(0, 3));
              }
            }
          }
        } catch {
          console.error(`All transcript methods failed for ${videoId}`);
        }
      }
    }

    // Final check to ensure all timestamps are valid numbers and properly scaled
    Object.keys(transcripts).forEach(videoId => {
      if (transcripts[videoId] && transcripts[videoId].length > 0) {
        transcripts[videoId] = transcripts[videoId].map(entry => {
          let start = typeof entry.start === 'number' && !isNaN(entry.start) ? entry.start : 0;
          const duration = typeof entry.duration === 'number' && !isNaN(entry.duration) ? entry.duration : 0;
          
          // One more check for timestamp scaling for consistency
          start = scaleTimestamp(start);
          
          return {
            text: entry.text,
            start,
            duration
          };
        });
      }
    });

    return {
      transcripts
    };
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return {
      error: "Failed to fetch transcripts. This could be due to transcripts being disabled for the videos or language unavailability.",
      transcripts: {}
    };
  }
}

export async function getVideoEngagementRatio(params: {
  videoIds: string[];
}) {
  // Validate API key first
  validateApiKey();
  
  const { videoIds } = params;
  
  // Get video details to calculate engagement
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.append('part', 'statistics');
  url.searchParams.append('id', videoIds.join(','));
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Calculate engagement ratios
    return data.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount) || 0;
      const likeCount = parseInt(item.statistics.likeCount) || 0;
      const commentCount = parseInt(item.statistics.commentCount) || 0;
      
      // Engagement as (likes + comments) / views
      const engagementRatio = viewCount > 0 
        ? ((likeCount + commentCount) / viewCount).toFixed(6)
        : "0";
        
      return {
        videoId: item.id,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        engagementRatio
      };
    });
  } catch (error) {
    console.error('Error calculating video engagement:', error);
    throw new Error('Failed to calculate video engagement from YouTube API');
  }
}

export async function getChannelStatistics(params: {
  channelIds: string[];
}) {
  // Validate API key first
  validateApiKey();
  
  const { channelIds } = params;
  
  const url = new URL(`${BASE_URL}/channels`);
  url.searchParams.append('part', 'snippet,statistics');
  url.searchParams.append('id', channelIds.join(','));
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to format that matches our MCP response
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      viewCount: item.statistics.viewCount,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount
    }));
  } catch (error) {
    console.error('Error fetching channel statistics:', error);
    throw new Error('Failed to fetch channel statistics from YouTube API');
  }
}

export async function getChannelTopVideos(params: {
  channelId: string;
  maxResults?: number;
}) {
  // Validate API key first
  validateApiKey();
  
  const { channelId, maxResults = 10 } = params;
  
  try {
    // 1. First get the uploads playlist ID for this channel
    const channelUrl = new URL(`${BASE_URL}/channels`);
    channelUrl.searchParams.append('part', 'contentDetails');
    channelUrl.searchParams.append('id', channelId);
    channelUrl.searchParams.append('key', YOUTUBE_API_KEY);
    
    const channelResponse = await fetch(channelUrl.toString());
    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.status}`);
    }
    
    const channelData = await channelResponse.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // 2. Get the videos from the uploads playlist
    const playlistUrl = new URL(`${BASE_URL}/playlistItems`);
    playlistUrl.searchParams.append('part', 'snippet');
    playlistUrl.searchParams.append('playlistId', uploadsPlaylistId);
    playlistUrl.searchParams.append('maxResults', maxResults.toString());
    playlistUrl.searchParams.append('key', YOUTUBE_API_KEY);
    
    const playlistResponse = await fetch(playlistUrl.toString());
    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`);
    }
    
    const playlistData = await playlistResponse.json();
    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }
    
    // 3. Get the video details for all videos to get view counts
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId);
    const videoDetailsUrl = new URL(`${BASE_URL}/videos`);
    videoDetailsUrl.searchParams.append('part', 'snippet,statistics');
    videoDetailsUrl.searchParams.append('id', videoIds.join(','));
    videoDetailsUrl.searchParams.append('key', YOUTUBE_API_KEY);
    
    const videoDetailsResponse = await fetch(videoDetailsUrl.toString());
    if (!videoDetailsResponse.ok) {
      throw new Error(`YouTube API error: ${videoDetailsResponse.status}`);
    }
    
    const videoDetailsData = await videoDetailsResponse.json();
    
    // 4. Sort by view count to get top videos
    const videos = videoDetailsData.items.sort((a: any, b: any) => {
      return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
    });
    
    // Transform to format that matches our MCP response
    return videos.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
      viewCount: video.statistics.viewCount
    }));
  } catch (error) {
    console.error('Error fetching channel top videos:', error);
    throw new Error('Failed to fetch channel top videos from YouTube API');
  }
} 