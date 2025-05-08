# YouTube Analytics
# Setting up the YouTube API Key

## Overview

This application uses the YouTube Data API to fetch real-time data. To use the app with real data, you'll need to:

1. Create a Google Cloud Platform project
2. Enable the YouTube Data API
3. Create an API key
4. Add the API key to your environment variables

## Step-by-Step Guide

### 1. Create a Google Cloud Platform Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Make note of your project ID

### 2. Enable the YouTube Data API

1. In your GCP project, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on the API and then click "Enable"

### 3. Create an API Key

1. In your GCP project, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API Key"
3. Your new API key will be displayed. Copy it for the next step.
4. (Optional but recommended) Restrict the API key to only the YouTube Data API to enhance security

### 4. Add the API Key to Your Application

#### Development Environment

Create a `.env.local` file in the project root and add your API key:

```
YOUTUBE_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with the actual API key you obtained from Google Cloud.

#### Production Environment

When deploying to production, add the `YOUTUBE_API_KEY` environment variable in your hosting platform's settings.

## API Quotas and Limitations

The YouTube Data API has daily quotas:

- By default, you get 10,000 units per day
- Different operations cost different amounts of quota units
- Monitor your usage in the Google Cloud Console under "APIs & Services" > "Dashboard"

## Troubleshooting

- If you see "API Key not valid" errors, check that you've correctly copied and set the key
- If you see "Quota exceeded" errors, you've hit your daily limit
- Make sure the API is enabled for your project

## Further Reading

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3/docs)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys) 