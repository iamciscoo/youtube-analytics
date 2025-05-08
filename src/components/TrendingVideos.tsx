'use client'

import { useState, useEffect } from 'react';
import VideoGrid from './VideoGrid';

const CATEGORIES = [
  { id: '0', name: 'All' },
  { id: '10', name: 'Music' },
  { id: '20', name: 'Gaming' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News' },
  { id: '28', name: 'Science & Tech' },
];

export default function TrendingVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('0');

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/youtube/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regionCode: 'US',
            categoryId: selectedCategory === '0' ? undefined : selectedCategory,
            maxResults: 12
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trending videos');
        }

        const data = await response.json();
        setVideos(data.items || []);
      } catch (err) {
        setError('Failed to load trending videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [selectedCategory]);

  return (
    <div className="w-full max-w-6xl">
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <VideoGrid 
        videos={videos} 
        isLoading={loading} 
        searchQuery="" 
      />
    </div>
  );
} 