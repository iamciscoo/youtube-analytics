declare module 'youtube-caption-scraper' {
  interface CaptionOptions {
    videoID: string;
    lang?: string;
  }
  
  interface Caption {
    start: string;
    dur: string;
    text: string;
  }
  
  export function getSubtitles(options: CaptionOptions): Promise<Caption[]>;
  
  const youtubeCaptionScraper: {
    getSubtitles: typeof getSubtitles;
  };
  
  export default youtubeCaptionScraper;
} 