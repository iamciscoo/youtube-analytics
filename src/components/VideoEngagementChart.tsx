'use client'

import { useState, useEffect, useRef } from 'react'

interface VideoEngagementProps {
  videoId: string;
}

interface EngagementData {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  engagementRatio: string;
}

export default function VideoEngagementChart({ videoId }: VideoEngagementProps) {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const fetchEngagementData = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/youtube/video-engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIds: [videoId] }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch engagement data')
        }

        const data = await response.json()
        if (data.items && data.items[0]) {
          setEngagementData({
            viewCount: data.items[0].statistics.viewCount,
            likeCount: data.items[0].statistics.likeCount,
            commentCount: data.items[0].statistics.commentCount,
            engagementRatio: data.items[0].statistics.engagementRatio
          })
        }
      } catch (err) {
        setError('Failed to load engagement data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEngagementData()
  }, [videoId])

  // Draw the chart when data is available
  useEffect(() => {
    if (engagementData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      
      const width = canvasRef.current.width
      const height = canvasRef.current.height
      const padding = 40
      
      // Draw background
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(0, 0, width, height)
      
      // Set up metrics
      const metrics = [
        { label: 'Views', value: parseInt(engagementData.viewCount) || 0 },
        { label: 'Likes', value: parseInt(engagementData.likeCount) || 0 },
        { label: 'Comments', value: parseInt(engagementData.commentCount) || 0 }
      ]
      
      // Calculate maximum value for scaling
      const maxValue = Math.max(...metrics.map(m => m.value))
      
      // Bar properties
      const barWidth = (width - 2 * padding) / metrics.length - 20
      
      // Draw bars
      metrics.forEach((metric, index) => {
        const x = padding + index * ((width - 2 * padding) / metrics.length)
        const barHeight = ((metric.value / maxValue) * (height - 2 * padding - 30)) || 0
        const y = height - padding - barHeight
        
        // Draw bar
        ctx.fillStyle = getColor(index)
        ctx.fillRect(x, y, barWidth, barHeight)
        
        // Draw label
        ctx.fillStyle = '#333'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(metric.label, x + barWidth / 2, height - padding + 15)
        
        // Draw value
        ctx.fillText(formatNumber(metric.value), x + barWidth / 2, y - 10)
      })
      
      // Draw engagement ratio
      const ratio = parseFloat(engagementData.engagementRatio) || 0
      ctx.fillStyle = '#333'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`Engagement Ratio: ${(ratio * 100).toFixed(2)}%`, width / 2, 25)
    }
  }, [engagementData])
  
  const getColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b']
    return colors[index % colors.length]
  }
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-60 bg-gray-200 rounded-lg mb-2"></div>
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

  if (!engagementData) {
    return <p className="text-gray-500">No engagement data available for this video</p>
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-center mb-4 font-medium">Video Engagement Metrics</h3>
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={300} 
        className="w-full"
      ></canvas>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700">Total Metrics</h4>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between">
              <span className="text-gray-600">Views:</span>
              <span className="font-medium">{formatNumber(parseInt(engagementData.viewCount) || 0)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Likes:</span>
              <span className="font-medium">{formatNumber(parseInt(engagementData.likeCount) || 0)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Comments:</span>
              <span className="font-medium">{formatNumber(parseInt(engagementData.commentCount) || 0)}</span>
            </li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700">Ratios</h4>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between">
              <span className="text-gray-600">Likes/Views:</span>
              <span className="font-medium">
                {((parseInt(engagementData.likeCount) || 0) / (parseInt(engagementData.viewCount) || 1) * 100).toFixed(2)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Comments/Views:</span>
              <span className="font-medium">
                {((parseInt(engagementData.commentCount) || 0) / (parseInt(engagementData.viewCount) || 1) * 100).toFixed(2)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Total Engagement:</span>
              <span className="font-medium">{(parseFloat(engagementData.engagementRatio) * 100).toFixed(2)}%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 