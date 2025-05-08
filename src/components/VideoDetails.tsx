'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoDetailsProps {
  videoId: string;
}

interface VideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  channelId?: string;
}

// Define interface for MCP response
interface VideoDetail {
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

// Define MCP function type
type McpGetVideoDetailsFn = (params: { 
  videoIds: string[] 
}) => Promise<VideoDetail[]>;

// Augment Window interface
interface CustomWindow extends Window {
  mcp_youtube_getVideoDetails?: McpGetVideoDetailsFn;
}

export default function VideoDetails({ videoId }: VideoDetailsProps) {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try to use MCP tools directly first
        const customWindow = window as unknown as CustomWindow;
        const hasMcpTools = typeof customWindow.mcp_youtube_getVideoDetails === 'function';
        
        if (hasMcpTools) {
          console.log('Using MCP tools directly for video details');
          try {
            const videoDetails = await customWindow.mcp_youtube_getVideoDetails!({ 
              videoIds: [videoId] 
            });
            
            if (videoDetails && videoDetails.length > 0) {
              const detail = videoDetails[0];
              setStats({
                viewCount: parseInt(detail.viewCount) || 0,
                likeCount: parseInt(detail.likeCount) || 0,
                commentCount: parseInt(detail.commentCount) || 0,
                channelId: detail.channelId
              });
              setLoading(false);
              return;
            }
          } catch (mcpError) {
            console.log('MCP fetch failed, falling back to API:', mcpError);
          }
        }
        
        // Fall back to API
        try {
          const response = await fetch('/api/youtube/video-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoIds: [videoId] }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch video details');
          }

          if (data.items && data.items[0]) {
            setStats({
              viewCount: parseInt(data.items[0].statistics?.viewCount || '0'),
              likeCount: parseInt(data.items[0].statistics?.likeCount || '0'),
              commentCount: parseInt(data.items[0].statistics?.commentCount || '0'),
              channelId: data.items[0].snippet?.channelId
            });
          } else {
            // If no data returned, create fallback stats
            setStats({
              viewCount: 0,
              likeCount: 0,
              commentCount: 0,
              channelId: undefined
            });
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          
          // If we have API errors, use fallback data
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`);
            // Wait a moment before retrying
            setTimeout(fetchDetails, 1000);
            return;
          }
          
          // After max retries, just show fallback data
          setStats({
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            channelId: undefined
          });
          setError('Stats temporarily unavailable');
        }
      } catch (err) {
        console.error('Fatal error in video details:', err);
        setError('Failed to load statistics');
        
        // Provide fallback stats after error
        setStats({
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          channelId: undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [videoId, retryCount]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>;
  }

  if (!stats) {
    return <div className="text-gray-500 text-sm">Statistics unavailable</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between p-4 bg-gray-50 rounded-md">
        <div className="text-center">
          <p className="text-lg font-semibold">{stats.viewCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Views</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{stats.likeCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Likes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{stats.commentCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Comments</p>
        </div>
      </div>
      
      {error && (
        <div className="text-amber-600 text-xs text-center py-1 bg-amber-50 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between text-sm">
        <Link 
          href={`/video/${videoId}`}
          className="text-blue-600 hover:underline"
        >
          View Details
        </Link>
        
        {stats.channelId && (
          <Link 
            href={`/channel/${stats.channelId}`}
            className="text-blue-600 hover:underline"
          >
            View Channel
          </Link>
        )}
      </div>
    </div>
  );
} 