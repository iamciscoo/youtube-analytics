'use client'

import { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import VideoCard from '@/components/VideoCard'

interface FormattedVideo {
  id: string | { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt?: string;
    thumbnails: {
      medium: { url: string };
    };
    description?: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
}

export default function Home() {
  const [videos, setVideos] = useState<FormattedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Fetch trending videos on initial load
  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    setError('');
    setIsSearchMode(false);
    
    try {
      // Use the API route to fetch trending videos
      const response = await fetch('/api/youtube/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ regionCode: 'US', maxResults: 12 })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message && data.items.length === 0) {
        // If we have a message but no items, it's likely a quota issue
        console.warn('API returned a message:', data.message);
        setError(data.message);
      }
      
      setVideos(data.items || []);
    } catch (err) {
      console.error('Error fetching trending videos:', err);
      setError('Failed to load trending videos');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setError('');
    setIsSearchMode(true);
    
    try {
      const response = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, maxResults: 12 })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message && data.items.length === 0) {
        // If we have a message but no items, it's likely a quota issue
        console.warn('API returned a message:', data.message);
        setError(data.message);
      }
      
      setVideos(data.items || []);
    } catch (err) {
      console.error('Error searching videos:', err);
      setError('Failed to search videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">YouTube Analytics</h1>
        
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {isSearchMode ? `Search Results: ${searchQuery}` : 'Trending Videos'}
          </h2>
          
          {isSearchMode && (
            <button 
              onClick={fetchTrendingVideos}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Back to Trending
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 h-96 animate-pulse">
                <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No videos found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard 
                key={typeof video.id === 'string' ? video.id : video.id.videoId} 
                video={video} 
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
