// Test script to check if MCP YouTube features are available
console.log('Testing MCP YouTube tools...');

// Try to access the MCP functions directly
try {
  console.log('Attempting to access mcp_youtube_getTrendingVideos...');
  if (typeof mcp_youtube_getTrendingVideos === 'function') {
    console.log('✅ MCP getTrendingVideos is available!');
    
    // Try to call the function
    mcp_youtube_getTrendingVideos({ regionCode: 'US', maxResults: 3 })
      .then(videos => {
        console.log('✅ Successfully retrieved trending videos:');
        console.log(JSON.stringify(videos, null, 2));
      })
      .catch(err => {
        console.error('❌ Error calling function:', err);
      });
  } else {
    console.log('❌ MCP getTrendingVideos is NOT available');
  }
} catch (e) {
  console.log('❌ Error accessing MCP function:', e.message);
}

// Try to access the search function
try {
  console.log('\nAttempting to access mcp_youtube_searchVideos...');
  if (typeof mcp_youtube_searchVideos === 'function') {
    console.log('✅ MCP searchVideos is available!');
    
    // Try to call the function
    mcp_youtube_searchVideos({ query: 'JavaScript tutorial', maxResults: 3 })
      .then(videos => {
        console.log('✅ Successfully retrieved search results:');
        console.log(JSON.stringify(videos, null, 2));
      })
      .catch(err => {
        console.error('❌ Error calling function:', err);
      });
  } else {
    console.log('❌ MCP searchVideos is NOT available');
  }
} catch (e) {
  console.log('❌ Error accessing MCP function:', e.message);
}

console.log('\nNote: MCP functions only work in the Cursor environment.');
console.log('If this script shows they are unavailable, you might be running it outside of Cursor\'s environment.'); 