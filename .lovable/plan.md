# Enhance News Page with Real Data Sources

## Current State
- `fetchLiveNews()` already fetches Google News RSS via rss2json.com (working, returning 200)
- Falls back to static `news_context.json` (7 hardcoded articles from late March 2026)
- Keyword-based classification for impact/category/items_affected

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

### 3. Add Perplexity AI-powered news summary (optional enhancement)
Create a new edge function `supabase/functions/news-ai/index.ts` that:
- Uses Lovable AI (LOVABLE_API_KEY already available) to generate a daily market intelligence summary
- Prompt: "Summarize the latest Malaysian food price news, policy changes, and supply chain updates"
- Display as a highlighted "AI Market Brief" card at the top of the news page
- No Perplexity connector needed — Lovable AI with `google/gemini-3-flash-preview` can generate contextual summaries from the RSS headlines we already fetch

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
- AI summary edge function uses non-streaming `supabase.functions.invoke()` call
- Cache AI summary for 1 hour via `staleTime` in react-query
