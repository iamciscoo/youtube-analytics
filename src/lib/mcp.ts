// MCP YouTube API wrapper

// Interface for trending videos response
export interface TrendingVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
}

// Interface for search results
export interface SearchResult {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
}

// Interface for video details
export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

// Interface for channel statistics
export interface ChannelStatistics {
  id: string;
  title: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

// Interface for transcript entry
export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

// Interface for related video
export interface RelatedVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

// Interface for video engagement metrics
export interface VideoEngagement {
  id: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  engagementRatio: number;
}

// Interface for channel top video
export interface ChannelTopVideo {
  id: string;
  title: string;
  viewCount: string;
  publishedAt: string;
  thumbnailUrl: string;
}

// Types for YouTube API responses
export interface SearchVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  description: string;
}

export interface VideoDetail {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface ChannelStatistic {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

export interface Transcript {
  [videoId: string]: TranscriptEntry[];
}

// Types for MCP functions
type McpYouTubeFunction<T, R> = (params: T) => Promise<R>;

// MCP function implementations using the Cursor MCP tools

// Get trending videos
export async function mcp_youtube_getTrendingVideos({ 
  regionCode = 'US', 
  categoryId, 
  maxResults = 10 
}: { 
  regionCode?: string; 
  categoryId?: string; 
  maxResults?: number; 
}): Promise<TrendingVideo[]> {
  console.log('Fetching trending videos with params:', { regionCode, categoryId, maxResults });
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { regionCode, categoryId, maxResults };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getTrendingVideos?: McpYouTubeFunction<typeof params, TrendingVideo[]> };
  const mcpFunction = globalObj.mcp_youtube_getTrendingVideos;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Search videos
export async function mcp_youtube_searchVideos({ 
  query, 
  maxResults = 10 
}: { 
  query: string; 
  maxResults?: number; 
}): Promise<SearchVideo[]> {
  console.log('Searching videos with query:', query);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { query, maxResults };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_searchVideos?: McpYouTubeFunction<typeof params, SearchVideo[]> };
  const mcpFunction = globalObj.mcp_youtube_searchVideos;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get video details
export async function mcp_youtube_getVideoDetails({ 
  videoIds
}: { 
  videoIds: string[] 
}): Promise<VideoDetail[]> {
  console.log('Fetching video details for:', videoIds);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { videoIds };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getVideoDetails?: McpYouTubeFunction<typeof params, VideoDetail[]> };
  const mcpFunction = globalObj.mcp_youtube_getVideoDetails;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get channel statistics
export async function mcp_youtube_getChannelStatistics({ 
  channelIds 
}: { 
  channelIds: string[] 
}): Promise<ChannelStatistic[]> {
  console.log('Fetching channel statistics for:', channelIds);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { channelIds };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getChannelStatistics?: McpYouTubeFunction<typeof params, ChannelStatistic[]> };
  const mcpFunction = globalObj.mcp_youtube_getChannelStatistics;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get transcripts
export async function mcp_youtube_getTranscripts({ 
  videoIds, 
  lang = 'en' 
}: { 
  videoIds: string[]; 
  lang?: string; 
}): Promise<Transcript> {
  console.log('Fetching transcripts for:', videoIds);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { videoIds, lang };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getTranscripts?: McpYouTubeFunction<typeof params, Transcript> };
  const mcpFunction = globalObj.mcp_youtube_getTranscripts;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get related videos
export async function mcp_youtube_getRelatedVideos({ 
  videoId, 
  maxResults = 10 
}: { 
  videoId: string; 
  maxResults?: number; 
}): Promise<RelatedVideo[]> {
  console.log('Fetching related videos for:', videoId);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { videoId, maxResults };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getRelatedVideos?: McpYouTubeFunction<typeof params, RelatedVideo[]> };
  const mcpFunction = globalObj.mcp_youtube_getRelatedVideos;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get video engagement metrics
export async function mcp_youtube_getVideoEngagementRatio({ 
  videoIds 
}: { 
  videoIds: string[] 
}): Promise<VideoEngagement[]> {
  console.log('Fetching video engagement for:', videoIds);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { videoIds };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getVideoEngagementRatio?: McpYouTubeFunction<typeof params, VideoEngagement[]> };
  const mcpFunction = globalObj.mcp_youtube_getVideoEngagementRatio;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
}

// Get channel top videos
export async function mcp_youtube_getChannelTopVideos({ 
  channelId, 
  maxResults = 10 
}: { 
  channelId: string; 
  maxResults?: number; 
}): Promise<ChannelTopVideo[]> {
  console.log('Fetching top videos for channel:', channelId);
  
  // Using Cursor's MCP tools - avoid recursive call
  const params = { channelId, maxResults };
  
  // Get the global MCP function
  const globalObj = globalThis as unknown as { mcp_youtube_getChannelTopVideos?: McpYouTubeFunction<typeof params, ChannelTopVideo[]> };
  const mcpFunction = globalObj.mcp_youtube_getChannelTopVideos;
  
  // Check if the function exists
  if (typeof mcpFunction !== 'function') {
    throw new Error('MCP function not available');
  }
  
  return await mcpFunction(params);
} 