'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import VideoRelated from '@/components/VideoRelated'
import VideoTranscript from '@/components/VideoTranscript'
import VideoEngagementChart from '@/components/VideoEngagementChart'

interface VideoDetailProps {
  id: string
  title: string
  channelTitle: string
  description: string
  viewCount: string
  likeCount: string
  commentCount: string
  engagementRatio: string
}

export default function VideoPage() {
  const params = useParams()
  const videoId = typeof params?.id === 'string' ? params.id : ''
  
  const [videoDetails, setVideoDetails] = useState<VideoDetailProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'related' | 'transcript' | 'engagement'>('related')

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/youtube/video-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIds: [videoId] }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch video details')
        }

        const data = await response.json()
        if (data.items && data.items[0]) {
          // Get engagement metrics
          const engagementResponse = await fetch('/api/youtube/video-engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoIds: [videoId] }),
          })
          
          const engagementData = await engagementResponse.json()
          const engagementRatio = engagementData.items && engagementData.items[0] ? 
            engagementData.items[0].statistics.engagementRatio : '0'
          
          setVideoDetails({
            id: videoId,
            title: data.items[0].snippet?.title || 'Unknown Title',
            channelTitle: data.items[0].snippet?.channelTitle || 'Unknown Channel',
            description: data.items[0].snippet?.description || 'No description available',
            viewCount: data.items[0].statistics?.viewCount || '0',
            likeCount: data.items[0].statistics?.likeCount || '0',
            commentCount: data.items[0].statistics?.commentCount || '0',
            engagementRatio
          })
        }
      } catch (err) {
        setError('Failed to load video details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideoDetails()
    }
  }, [videoId])

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="animate-pulse">
            <div className="h-[480px] bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !videoDetails) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error || 'Video not found'}</p>
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

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
        
        <div className="aspect-video mb-4">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}`} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="rounded-lg shadow-lg"
          ></iframe>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{videoDetails.title}</h1>
        <p className="text-gray-700 mb-2">Channel: {videoDetails.channelTitle}</p>
        
        <div className="flex gap-4 items-center mb-4 text-gray-600">
          <span>{formatCount(videoDetails.viewCount)} views</span>
          <span>{formatCount(videoDetails.likeCount)} likes</span>
          <span>{formatCount(videoDetails.commentCount)} comments</span>
          <span title="Engagement ratio (likes + comments) / views">
            Engagement: {(parseFloat(videoDetails.engagementRatio) * 100).toFixed(2)}%
          </span>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-line">{videoDetails.description}</p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('related')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'related'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Related Videos
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'transcript'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'engagement'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Engagement Metrics
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        {activeTab === 'related' && <VideoRelated videoId={videoId} />}
        {activeTab === 'transcript' && <VideoTranscript videoId={videoId} />}
        {activeTab === 'engagement' && <VideoEngagementChart videoId={videoId} />}
      </div>
    </div>
  )
} 