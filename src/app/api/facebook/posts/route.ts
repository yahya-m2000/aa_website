import { NextResponse } from 'next/server';
import type { FacebookFeedResponse } from '@/types/facebook';

// Cache the response for 30 minutes
export const revalidate = 1800;

export async function GET() {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const systemUserToken = process.env.FACEBOOK_SYS_USER_TOKEN;

    if (!pageId || !systemUserToken) {
      console.error('Missing Facebook credentials');
      return NextResponse.json(
        { error: 'Facebook credentials not configured' },
        { status: 500 }
      );
    }

    // Step 1: Get Page Access Token using System User Token
    const pageTokenUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${systemUserToken}`;

    const pageTokenResponse = await fetch(pageTokenUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!pageTokenResponse.ok) {
      const errorData = await pageTokenResponse.json();
      console.error('Failed to get Page Access Token:', errorData);
      return NextResponse.json(
        { error: 'Failed to get page access token', details: errorData },
        { status: pageTokenResponse.status }
      );
    }

    const pageTokenData = await pageTokenResponse.json();
    const pageAccessToken = pageTokenData.access_token;

    if (!pageAccessToken) {
      console.error('No page access token in response');
      return NextResponse.json(
        { error: 'Could not obtain page access token' },
        { status: 500 }
      );
    }

    // Step 2: Fetch posts using Page Access Token
    const graphApiUrl = `https://graph.facebook.com/v19.0/${pageId}/posts`;
    const params = new URLSearchParams({
      fields: 'id,message,created_time,full_picture,permalink_url,attachments{media,type,subattachments}',
      limit: '9',
      access_token: pageAccessToken,
    });

    const response = await fetch(`${graphApiUrl}?${params}`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch Facebook posts', details: errorData },
        { status: response.status }
      );
    }

    const data: FacebookFeedResponse = await response.json();

    return NextResponse.json({
      posts: data.data || [],
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
