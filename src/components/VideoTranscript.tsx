'use client'

import { useState, useEffect } from 'react'

interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

interface VideoTranscriptProps {
  videoId: string;
}

export default function VideoTranscript({ videoId }: VideoTranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Format time as MM:SS - moved up to fix reference error
  const formatTime = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0:00';
    }
    
    // Ensure seconds is a positive number
    seconds = Math.max(0, seconds);
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Convert timestamps to proper YouTube timestamps
  const scaleTimestamp = (value: number): number => {
    // If the value is extremely small (0-1), it's not seconds but a fraction of the video duration
    // These small values are actual time points in seconds
    if (value >= 0 && value < 1) {
      // For YouTube direct timestamps (0.58, 0.6, etc) in transcripts
      // These are actually direct seconds (e.g., 0.58 = 0 seconds)
      return Math.floor(value); // Take just the integer part (0.58 -> 0)
    } else if (value >= 1 && value < 100) {
      // For values like 3.2, 5.6, etc. which are actual second values
      return Math.floor(value); // Take just the integer part (3.2 -> 3)
    }
    
    // For small decimals like 0.001, 0.003, etc., they need multiplication (actual timestamps)
    if (value > 0 && value < 0.1) {
      // These are direct time points (e.g., 0.001 = 1 second)
      // Multiply by 1000 to get proper seconds
      return Math.floor(value * 1000);
    }
    
    // If value is a reasonable timestamp already
    return Math.floor(value);
  }
  
  useEffect(() => {
    const fetchTranscript = async () => {
      setLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/youtube/transcripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoIds: [videoId] }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch transcript')
        }

        const data = await response.json()
        console.log('Transcript data received:', data)
        
        if (data.transcripts && data.transcripts[videoId]) {
          // Process and scale the timestamps
          const processedTranscript = data.transcripts[videoId].map((entry: any) => {
            // Convert strings to numbers if needed
            const rawStart = typeof entry.start === 'string' ? parseFloat(entry.start) : entry.start;
            const duration = typeof entry.duration === 'string' ? parseFloat(entry.duration) : entry.duration;
            
            // Map the timestamp to the correct video position
            const start = scaleTimestamp(rawStart);
            
            return {
              text: entry.text,
              start,
              duration
            };
          });
          
          // Debug first few entries to check scaling
          const firstFew = processedTranscript.slice(0, 5).map(e => ({ 
            text: e.text.substring(0, 20),
            originalStart: data.transcripts[videoId].find((o: any) => o.text === e.text)?.start,
            start: e.start, 
            formatted: formatTime(e.start) 
          }));
          
          console.log('Processed transcript entries with scaled timestamps:', firstFew);
          
          // Sort transcript entries by start time to ensure correct order
          const sortedTranscript = [...processedTranscript].sort((a, b) => a.start - b.start);
          
          // Check if all timestamps are zero (a common YouTube transcript issue)
          const allZeroTimestamps = sortedTranscript.every(entry => entry.start === 0);
          
          if (allZeroTimestamps && sortedTranscript.length > 0) {
            console.log('All timestamps are zero, generating progressive timestamps');
            
            // Generate progressive timestamps - estimate 3 seconds per subtitle entry
            const SECONDS_PER_ENTRY = 3; 
            
            // Create new transcript with progressive timestamps
            const progressiveTranscript = sortedTranscript.map((entry, index) => ({
              text: entry.text,
              start: index * SECONDS_PER_ENTRY,
              duration: entry.duration || SECONDS_PER_ENTRY
            }));
            
            setTranscript(progressiveTranscript);
          } else {
            setTranscript(sortedTranscript);
          }
        } else {
          setTranscript([])
        }
      } catch (err) {
        setError('Failed to load transcript')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [videoId])

  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
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

  if (transcript.length === 0) {
    return <p className="text-gray-500">No transcript available for this video</p>
  }
  
  // Decode HTML entities in transcript text
  const decodeHtmlEntities = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'");
    return textArea.value;
  }

  console.log('Rendering transcript entries:', transcript.slice(0, 5).map(t => ({
    text: t.text.substring(0, 20),
    start: t.start,
    formatted: formatTime(t.start)
  })));

  return (
    <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4">
      {transcript.map((entry, i) => {
        // Get the formatted time for this entry
        const formattedTime = formatTime(entry.start);
        
        return (
          <div 
            key={i} 
            className="mb-2 p-2 hover:bg-gray-50 rounded flex gap-3 cursor-pointer"
            onClick={() => {
              // Clicking on transcript seeks the YouTube player
              const iframe = document.querySelector('iframe') as HTMLIFrameElement
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                  JSON.stringify({
                    event: 'command',
                    func: 'seekTo',
                    args: [entry.start]
                  }), 
                  '*'
                )
              }
            }}
          >
            <span className="text-gray-500 whitespace-nowrap flex-shrink-0 w-12 select-none">
              {formattedTime}
            </span>
            <span>{decodeHtmlEntities(entry.text)}</span>
          </div>
        );
      })}
    </div>
  )
} 