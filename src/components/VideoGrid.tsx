'use client'

import VideoCard from './VideoCard'

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  searchQuery: string;
}

export default function VideoGrid({ videos, isLoading, searchQuery }: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-md">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
      {videos.map((video) => (
        <VideoCard key={video.id.videoId} video={video} />
      ))}
      
      {videos.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          {searchQuery ? 'No videos found' : 'Search for videos to start'}
        </div>
      )}
    </div>
  )
} 