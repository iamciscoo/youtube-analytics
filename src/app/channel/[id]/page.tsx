'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface ChannelData {
  id: string
  title: string
  subscriberCount: string
  viewCount: string
  videoCount: string
}

interface TopVideo {
  id: { videoId: string }
  snippet: {
    title: string
    publishedAt: string
    thumbnails: {
      medium: { url: string }
    }
  }
  statistics: {
    viewCount: string
  }
}

export default function ChannelPage() {
  const params = useParams()
  const channelId = typeof params?.id === 'string' ? params.id : ''
  
  const [channelData, setChannelData] = useState<ChannelData | null>(null)
  const [topVideos, setTopVideos] = useState<TopVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Fetch channel statistics
        const channelResponse = await fetch('/api/youtube/channel-statistics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelIds: [channelId] }),
        })

        if (!channelResponse.ok) {
          throw new Error('Failed to fetch channel data')
        }

        const channelData = await channelResponse.json()
        
        if (channelData.items && channelData.items[0]) {
          setChannelData({
            id: channelId,
            title: channelData.items[0].snippet?.title || 'Unknown Channel',
            subscriberCount: channelData.items[0].statistics?.subscriberCount || '0',
            viewCount: channelData.items[0].statistics?.viewCount || '0',
            videoCount: channelData.items[0].statistics?.videoCount || '0'
          })
        }
        
        // Fetch channel top videos
        const topVideosResponse = await fetch('/api/youtube/channel-top-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId, maxResults: 10 }),
        })

        if (!topVideosResponse.ok) {
          throw new Error('Failed to fetch top videos')
        }

        const topVideosData = await topVideosResponse.json()
        setTopVideos(topVideosData.items || [])
      } catch (err) {
        setError('Failed to load channel data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (channelId) {
      fetchChannelData()
    }
  }, [channelId])

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !channelData) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error || 'Channel not found'}</p>
            <Link href="/" className="font-medium text-red-800 hover:underline mt-2 inline-block">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatCount = (count: string) => {
    const num = parseInt(count)
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return count
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
        
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{channelData.title}</h1>
          
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold">{formatCount(channelData.subscriberCount)}</span>
              <span className="text-sm opacity-80">Subscribers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{formatCount(channelData.viewCount)}</span>
              <span className="text-sm opacity-80">Total Views</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{formatCount(channelData.videoCount)}</span>
              <span className="text-sm opacity-80">Videos</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Top Videos</h2>
        
        {topVideos.length === 0 ? (
          <p className="text-gray-500">No videos found for this channel</p>
        ) : (
          <div className="space-y-4">
            {topVideos.map(video => (
              <Link
                key={video.id.videoId}
                href={`/video/${video.id.videoId}`}
                className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-48 h-28 overflow-hidden rounded">
                  <img 
                    src={video.snippet.thumbnails.medium.url} 
                    alt={video.snippet.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg line-clamp-2">{video.snippet.title}</h3>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>{formatDate(video.snippet.publishedAt)}</span>
                    <span>{formatCount(video.statistics.viewCount)} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 