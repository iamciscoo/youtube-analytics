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

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        
        // Try to use MCP tools directly first
        const customWindow = window as unknown as CustomWindow;
        const hasMcpTools = typeof customWindow.mcp_youtube_getVideoDetails === 'function';
        
        if (hasMcpTools) {
          console.log('Using MCP tools directly for video details');
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
        }
        
        // Fall back to API
        const response = await fetch('/api/youtube/video-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIds: [videoId] }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }

        const data = await response.json();
        if (data.items && data.items[0]) {
          setStats({
            viewCount: parseInt(data.items[0].statistics.viewCount) || 0,
            likeCount: parseInt(data.items[0].statistics.likeCount) || 0,
            commentCount: parseInt(data.items[0].statistics.commentCount) || 0,
            channelId: data.items[0].snippet?.channelId
          });
        }
      } catch (err) {
        setError('Failed to load video statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [videoId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!stats) {
    return null;
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