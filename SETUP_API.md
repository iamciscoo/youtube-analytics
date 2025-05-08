# Setting Up YouTube API for Online Deployment

This guide explains how to set up your YouTube Analytics application to work online with the official YouTube Data API v3.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID for later use

## Step 2: Enable YouTube Data API v3

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on the result and press "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your new API key
4. (Optional but recommended) Restrict the API key to only work with YouTube Data API v3

## Step 4: Add API Key to Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add your API key as follows:
   ```
   YOUTUBE_API_KEY=YOUR_API_KEY_HERE
   ```
3. For production deployment, add the environment variable to your hosting platform's environment settings

## Step 5: Configure for Production

When deploying to Vercel, Netlify, or other platforms:

1. Add `YOUTUBE_API_KEY` as an environment variable in your hosting platform's settings
2. Make sure the API key is kept private and not committed to your code repository

## API Usage Notes

The YouTube Data API has quotas and limits:

- The free tier provides 10,000 units per day
- Different operations cost different amounts of quota
- Simple search operations cost 100 units, meaning you can perform 100 searches per day with the free tier

For high-traffic applications, consider:
- Implementing caching for API responses
- Requesting a quota increase from Google
- Setting up quota monitoring alerts

## Troubleshooting

If you see errors like "API key not valid" or "Quota exceeded":

1. Verify your API key is correct and properly restricted
2. Check your quota usage in Google Cloud Console under "APIs & Services" > "Dashboard"
3. Consider implementing exponential backoff on API requests for better reliability

For more details, see the [YouTube Data API Documentation](https://developers.google.com/youtube/v3/docs). 