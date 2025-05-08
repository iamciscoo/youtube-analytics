'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

// Define MCP related video interface
interface RelatedVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

// Define MCP function type
type McpGetRelatedVideosFn = (params: { 
  videoId: string;
  maxResults?: number;
}) => Promise<RelatedVideo[]>;

// Augment Window interface
interface CustomWindow extends Window {
  mcp_youtube_getRelatedVideos?: McpGetRelatedVideosFn;
}

interface VideoRelatedProps {
  videoId: string;
}

export default function VideoRelated({ videoId }: VideoRelatedProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchRelatedVideos = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Try to use MCP tools directly first
        const customWindow = window as unknown as CustomWindow;
        const hasMcpTools = typeof customWindow.mcp_youtube_getRelatedVideos === 'function';
        
        if (hasMcpTools) {
          console.log('Using MCP tools directly for related videos');
          const relatedVideos = await customWindow.mcp_youtube_getRelatedVideos!({ 
            videoId,
            maxResults: 8
          });
          
          if (relatedVideos && relatedVideos.length > 0) {
            // Transform to the expected format
            const formattedVideos = relatedVideos.map(video => ({
              id: { videoId: video.id },
              snippet: {
                title: video.title,
                channelTitle: video.channelTitle,
                thumbnails: {
                  medium: { url: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` }
                }
              }
            }));
            
            setVideos(formattedVideos);
            setLoading(false);
            return;
          }
        }
        
        // Fall back to API if MCP tools not available
        const response = await fetch('/api/youtube/related-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId, maxResults: 8 }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch related videos')
        }

        const data = await response.json()
        setVideos(data.items || [])
      } catch (err) {
        setError('Failed to load related videos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedVideos()
  }, [videoId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-28 w-full rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return <p className="text-gray-500">No related videos found</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map(video => (
        <Link 
          href={`/video/${video.id.videoId}`} 
          key={video.id.videoId}
          className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 w-40 h-24 overflow-hidden rounded">
            <img 
              src={video.snippet.thumbnails.medium.url} 
              alt={video.snippet.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">{video.snippet.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{video.snippet.channelTitle}</p>
          </div>
        </Link>
      ))}
    </div>
  )
} 