'use client'

import Link from 'next/link'
import VideoDetails from './VideoDetails';

interface VideoCardProps {
  video: {
    id: { videoId: string } | string;
    snippet: {
      title: string;
      channelTitle: string;
      description?: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
    };
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  // Determine video ID from different formats
  const videoId = typeof video.id === 'string' 
    ? video.id 
    : video.id.videoId;
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/video/${videoId}`}>
        <img 
          src={video.snippet.thumbnails.medium.url} 
          alt={video.snippet.title}
          className="w-full object-cover h-48"
        />
      </Link>
      <div className="p-4">
        <Link href={`/video/${videoId}`} className="block">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {video.snippet.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{video.snippet.channelTitle}</p>
        {video.snippet.description && (
          <p className="text-gray-500 text-sm line-clamp-3 mb-4">
            {video.snippet.description}
          </p>
        )}
        
        <VideoDetails videoId={videoId} />
        
        <div className="mt-4 text-right">
          <Link 
            href={`/video/${videoId}`}
            className="inline-block px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 