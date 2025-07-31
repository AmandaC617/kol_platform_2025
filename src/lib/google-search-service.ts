export interface SocialMediaSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

export class GoogleSearchService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY || "";
  private static readonly SEARCH_ENGINE_ID = "017576662512468239146:omuauf_lfve"; // General web search
  private static readonly BASE_URL = "https://www.googleapis.com/customsearch/v1";

  static async searchSocialMediaProfile(query: string, platform?: string): Promise<SocialMediaSearchResult[]> {
    if (!this.API_KEY) {
      console.warn("Google Search API key not configured, using fallback");
      return [];
    }

    try {
      let searchQuery = query;

      // Add platform-specific site search if platform is specified
      if (platform) {
        switch (platform.toLowerCase()) {
          case 'instagram':
            searchQuery += ' site:instagram.com';
            break;
          case 'youtube':
            searchQuery += ' site:youtube.com';
            break;
          case 'tiktok':
            searchQuery += ' site:tiktok.com';
            break;
          case 'facebook':
            searchQuery += ' site:facebook.com';
            break;
          case 'twitter':
          case 'x':
            searchQuery += ' site:twitter.com OR site:x.com';
            break;
        }
      }

      const params = new URLSearchParams({
        key: this.API_KEY,
        cx: this.SEARCH_ENGINE_ID,
        q: searchQuery,
        num: '5', // Return top 5 results
        safe: 'active'
      });

      let response;
      try {
        response = await fetch(`${this.BASE_URL}?${params}`);
      } catch (fetchError) {
        console.warn('Google Search API 網絡請求失敗:', fetchError);
        console.warn('可能的原因: 網絡連接問題、CORS 限制、或 API 端點不可達');
        return [];
      }

      if (!response.ok) {
        // 處理不同的錯誤狀態碼
        if (response.status === 403) {
          console.warn("Google Search API access denied (403). This could be due to invalid API key, quota exceeded, or incorrect search engine ID.");
          return [];
        } else if (response.status === 429) {
          console.warn("Google Search API quota exceeded (429). Please check your API quota.");
          return [];
        } else {
          console.warn(`Google Search API error: ${response.status} - ${response.statusText}`);
          return [];
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn('Google Search API 響應解析失敗:', parseError);
        return [];
      }

      // 檢查 API 錯誤回應
      if (data.error) {
        console.warn("Google Search API returned error:", data.error);
        return [];
      }

      if (data.items) {
        return data.items.map((item: { title: string; link: string; snippet: string; displayLink: string; formattedUrl: string }) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl
        }));
      }

      return [];

    } catch (error) {
      console.error("Google Search API error:", error);
      return [];
    }
  }

  static async enhanceInfluencerData(url: string): Promise<{
    relatedProfiles: SocialMediaSearchResult[];
    mentions: SocialMediaSearchResult[];
  }> {
    try {
      // Extract username or channel name from URL
      const username = this.extractUsernameFromUrl(url);
      const platform = this.detectPlatformFromUrl(url);

      if (!username) {
        return { relatedProfiles: [], mentions: [] };
      }

      // Search for related profiles and mentions
      const [relatedProfiles, mentions] = await Promise.all([
        this.searchSocialMediaProfile(`"${username}" ${platform} profile`),
        this.searchSocialMediaProfile(`"${username}" ${platform} collaboration review`)
      ]);

      return {
        relatedProfiles: relatedProfiles.slice(0, 3),
        mentions: mentions.slice(0, 3)
      };

    } catch (error) {
      console.error("Error enhancing influencer data:", error);
      return { relatedProfiles: [], mentions: [] };
    }
  }

  private static extractUsernameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Common patterns for extracting usernames
      const patterns = [
        /\/(@[\w.-]+)/,           // @username pattern
        /\/c\/([\w.-]+)/,         // YouTube channel
        /\/user\/([\w.-]+)/,      // User pattern
        /\/profile\/([\w.-]+)/,   // Profile pattern
        /\/([^\/]+)\/?$/          // Last segment
      ];

      for (const pattern of patterns) {
        const match = pathname.match(pattern);
        if (match && match[1]) {
          return match[1].replace('@', '');
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private static detectPlatformFromUrl(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('tiktok')) return 'TikTok';
    if (hostname.includes('facebook')) return 'Facebook';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';

    return 'Social Media';
  }
}
