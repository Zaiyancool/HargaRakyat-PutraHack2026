

# Enhance News Page with Real Data Sources

## Overview
Remove static placeholder news, add more Malaysian RSS feeds, and add an AI-generated market intelligence summary at the top of the news page.

## Changes

### 1. Remove static placeholder news
- Delete `public/data/news_context.json`
- Remove `fetchNewsContext` export from `pricecatcher.ts`
- Update `fetchLiveNews()` to no longer load/merge static news — rely purely on live RSS
- Keep the classification logic (it works well for live articles too)

### 2. Add more Malaysian RSS sources
Add direct RSS feeds alongside Google News for broader coverage:
- **Bernama**: `https://www.bernama.com/en/rss/general.xml`
- **The Star Business**: `https://www.thestar.com.my/rss/News/Business`
- **Free Malaysia Today**: `https://www.freemalaysiatoday.com/rss/`
- **Malay Mail**: `https://www.malaymail.com/feed/rss/malaysia`

All via the same rss2json.com proxy (free, no API key). Add Malaysian food/price keyword filtering so only relevant articles surface.

### 3. Add AI-powered market intelligence brief
Create a new edge function `supabase/functions/news-ai/index.ts` that:
- Uses Lovable AI (LOVABLE_API_KEY already available) to generate a market intelligence summary
- Takes the fetched RSS headlines as input context
- Returns a concise "AI Market Brief" analyzing trends and implications for Malaysian grocery prices
- Display as a highlighted card at the top of the news page

### Files to Change
| File | Change |
|------|--------|
| `src/lib/pricecatcher.ts` | Add more RSS feeds, remove static news dependency, add keyword filter |
| `public/data/news_context.json` | Delete |
| `src/components/FoodNewsWidget.tsx` | Add "AI Market Brief" card, update loading states |
| `supabase/functions/news-ai/index.ts` | New edge function for AI news summary |
| `src/pages/News.tsx` | Minor layout update for AI brief section |

### Technical Details
- RSS feeds via rss2json.com: `https://api.rss2json.com/v1/api.json?rss_url={encoded_feed_url}`
- Keyword filter for relevance: `harga|price|food|makanan|grocery|inflation|subsid|ayam|telur|beras|sayur|minyak|gula`
- Cap at 15 articles total, sorted by date descending
- AI summary uses non-streaming `supabase.functions.invoke()` call
- Cache AI summary for 1 hour via `staleTime` in react-query

