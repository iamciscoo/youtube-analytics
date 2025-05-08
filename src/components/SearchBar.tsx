'use client'

import { useState } from 'react'

// Define video interfaces
interface YouTubeVideo {
  id?: string | { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    description?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
  };
  title?: string;
  channelTitle?: string;
  description?: string;
  thumbnailUrl?: string;
}

interface FormattedVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      medium: { url: string };
    };
  };
}

// Type for the global MCP function
type McpSearchFn = (params: { 
  query: string; 
  maxResults?: number 
}) => Promise<YouTubeVideo[]>;

// Augment Window interface
interface CustomWindow extends Window {
  mcp_youtube_searchVideos?: McpSearchFn;
}

interface SearchBarProps {
  onSearch: (query: string, videos?: FormattedVideo[]) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      // First try using MCP directly if available
      const customWindow = window as unknown as CustomWindow;
      const hasMcpTools = typeof customWindow.mcp_youtube_searchVideos === 'function';
      
      if (hasMcpTools) {
        console.log('Using MCP tools directly for search');
        const videos = await customWindow.mcp_youtube_searchVideos!({ 
          query: query.trim(), 
          maxResults: 12 
        });
        
        if (videos && videos.length > 0) {
          // Format the videos and pass them to the parent component
          const formattedVideos = videos.map((video: YouTubeVideo) => {
            // Handle different video result formats
            let videoId = '';
            if (typeof video.id === 'string') {
              videoId = video.id;
            } else if (video.id && typeof video.id === 'object') {
              videoId = video.id.videoId || '';
            }
            
            return {
              id: { videoId },
              snippet: {
                title: video.snippet?.title || video.title || '',
                channelTitle: video.snippet?.channelTitle || video.channelTitle || '',
                description: video.snippet?.description || video.description || '',
                thumbnails: {
                  medium: { 
                    url: video.snippet?.thumbnails?.medium?.url || 
                         video.thumbnailUrl || 
                         `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
                  }
                }
              }
            };
          });
          
          // Pass query and formatted videos to parent
          onSearch(query.trim(), formattedVideos);
          return;
        }
      }
      
      // If MCP isn't available or returns no results, just pass the query to parent
      // The parent will handle the API call
      onSearch(query.trim());
    } catch (error) {
      console.error('Error searching videos:', error);
      // Fall back to API
      onSearch(query.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search YouTube videos..."
        className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`bg-blue-600 text-white px-6 py-3 rounded-r-md ${
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
} 