

# HargaRakyat: AI Chat Advisor + Animations + Mobile Optimization

## Overview
Three features: (1) AI Chat Advisor sidebar using Lovable AI (free, uses pre-configured `LOVABLE_API_KEY`), (2) Framer Motion animations and skeleton loaders, (3) mobile-first responsive optimization with hamburger nav.

## 1. AI Chat Advisor Sidebar

### Backend: Edge Function
Create `supabase/functions/chat/index.ts` that:
- Accepts `{ messages, context }` from the client
- Calls Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with `google/gemini-3-flash-preview`
- System prompt: "You are HargaRakyat AI advisor. You have access to Malaysian grocery price data. Help users decide when to buy items, suggest savings strategies, and explain price trends. Be concise and actionable. Respond in English or Malay based on user's language."
- Streams SSE response back to client
- Handles 429/402 errors gracefully

### Frontend: Chat Sidebar Component
Create `src/components/AIChatAdvisor.tsx`:
- Floating chat button (bottom-right corner) with Bot icon
- Opens a slide-in panel/drawer on click
- Chat interface with message history, markdown rendering (install `react-markdown`)
- Pre-built quick prompts: "When should I buy chicken?", "What items are getting cheaper?", "Best stores near me?"
- Streams AI responses token-by-token
- Context-aware: passes current forecast data summary to the AI so it can reference real trends

### Dependencies
- Add `react-markdown` for rendering AI responses

### Files
| File | Action |
|------|--------|
| `supabase/functions/chat/index.ts` | Create edge function |
| `src/components/AIChatAdvisor.tsx` | Create chat sidebar |
| `src/pages/Index.tsx` | Add AIChatAdvisor component |

## 2. Micro-Interactions & Animations

### Approach: CSS animations (no Framer Motion needed)
Use Tailwind + `tailwindcss-animate` (already installed) to avoid adding another dependency. This is lighter and avoids potential React version conflicts.

### Changes
- **Skeleton loaders**: Create `src/components/SkeletonCard.tsx` — reusable skeleton for loading states in PriceExplorer, PriceForecast, StoreFinder, etc. Replace `<Loader2>` spinners with skeleton placeholders
- **Card entrance animations**: Add staggered `animate-fade-in` with CSS `animation-delay` to cards in all sections
- **Hover effects on glass-cards**: Add `hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 transition-all duration-300` to `.glass-card` in `index.css`
- **Data point hover glow**: Add glow effect on stat cards on hover
- **Smooth scroll**: Add `scroll-behavior: smooth` to html

### Files
| File | Action |
|------|--------|
| `src/index.css` | Add hover effects to glass-card, smooth scroll, stagger animation utilities |
| `tailwind.config.ts` | Add fade-in-up, stagger keyframes |
| `src/components/SkeletonCard.tsx` | Create reusable skeleton loader |
| All section components | Replace Loader2 with skeletons, add entrance animations |

## 3. Mobile-First Optimization

### Navigation
- Add hamburger menu (Sheet/Drawer) for mobile nav in `Index.tsx`
- Show section links in a slide-out drawer on small screens
- Add the AI Chat button to mobile nav too

### Touch-friendly
- Increase tap targets on mobile (min 44px)
- Make filter selects full-width on mobile (already mostly done)
- Ensure tables scroll horizontally with visible scroll indicators
- Make store cards stack properly on small screens

### Responsive tweaks
- Hero section: smaller text on mobile, single-column stats
- Price Explorer table: horizontal scroll with sticky first column
- Charts: reduce height on mobile (300px vs 400px)
- Nav sections: scrollable horizontal on tablet

### Files
| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Add mobile hamburger nav with Sheet component |
| `src/components/PriceExplorer.tsx` | Sticky first column on mobile |
| `src/components/PriceChart.tsx` | Responsive chart height |
| `src/components/PriceForecast.tsx` | Responsive chart height |
| `src/components/HeroSection.tsx` | Mobile text sizing |

## Cost Note
The AI Chat uses **Lovable AI** which is already included with your project (LOVABLE_API_KEY is pre-configured). No external API keys needed. You get free included usage per month. If you exceed that, you can top up credits in Settings > Workspace > Usage.

## Files Summary (12 files)

| File | Action |
|------|--------|
| `supabase/functions/chat/index.ts` | Create — AI chat edge function |
| `src/components/AIChatAdvisor.tsx` | Create — Chat sidebar UI |
| `src/components/SkeletonCard.tsx` | Create — Reusable skeleton loader |
| `src/index.css` | Update — Glass-card hover, smooth scroll, stagger utils |
| `tailwind.config.ts` | Update — New animation keyframes |
| `src/pages/Index.tsx` | Update — Mobile nav + chat button |
| `src/components/HeroSection.tsx` | Update — Entrance animations, mobile sizing |
| `src/components/PriceExplorer.tsx` | Update — Skeletons, animations, mobile table |
| `src/components/PriceForecast.tsx` | Update — Skeletons, animations, responsive chart |
| `src/components/PriceChart.tsx` | Update — Skeletons, animations, responsive chart |
| `src/components/StoreFinder.tsx` | Update — Skeletons, animations |
| `src/components/GroceryOptimizer.tsx` | Update — Skeletons, animations |

