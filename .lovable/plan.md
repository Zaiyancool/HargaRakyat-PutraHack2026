

# UI/UX Review & Fix Plan

## Issues Found

### Critical Layout Issues

**1. Mobile: Phone mockup too large, overflows viewport**
On 390px mobile, the phone image at `h-[600px]` dominates the viewport and pushes content far down. The mockup extends beyond the visible area and creates excessive whitespace below it before the stats bar.

**2. Mobile: Stats bar numbers overflow on small screens**
The stat values (e.g. "1,509,649") at `text-5xl` / `md:text-[56px]` are too large for mobile — they nearly touch card edges on 390px screens. The "RM 16.28" value also runs wide.

**3. Mobile: Item grid cards clipped at edges**
The first and last cards in the marquee rows get clipped at screen edges (visible in screenshots — left column items like "HALIA BASAH (TUA)" are cut off).

**4. Desktop: Large empty whitespace between hero and stats bar**
There's a ~5rem negative margin gap that creates too much dead space between the phone mockup and the stats card on desktop.

### Design Polish Issues

**5. Landing page hero: No visual hierarchy between sections**
The transition from hero → stats → item grid → why section is flat. Adding subtle section dividers or background color alternation would improve flow.

**6. Item grid section: Cards lack food images/icons**
All item cards are plain text — no emoji or icon to represent the food category. This makes them visually monotonous.

**7. Stats bar: Font weight too light**
The stat numbers use `font-medium` which feels thin for such prominent data. Should be `font-bold` for impact.

**8. Mobile: TopNav hamburger menu accessibility**
The mobile nav works but the Sheet doesn't have an accessible title (missing `SheetTitle`), which triggers accessibility warnings.

### Performance Notes
- DOM nodes: 17,925 (high but acceptable for data-heavy page)
- FCP: ~3s (Vite dev mode — production will be much faster)
- Mockup image: 111KB WebP — well optimized
- No JS errors in console, only React Router v7 deprecation warnings (harmless)

## Proposed Fixes

### `src/components/landing/HeroSection.tsx`
1. **Reduce mobile mockup size**: `h-[420px]` mobile, keep `md:h-[620px]` desktop
2. **Fix stats bar**: Reduce stat font to `text-3xl sm:text-4xl md:text-[56px]` so mobile doesn't overflow
3. **Bold stat numbers**: `font-medium` → `font-bold`
4. **Reduce hero bottom padding on mobile**: `pb-16 md:pb-32` to tighten mobile layout
5. **Tighten negative margin**: `mt-[-3rem] md:mt-[-5rem]` for responsive spacing

### `src/components/landing/ItemGrid.tsx`
6. **Add food emoji to cards**: Map item categories to emoji (vegetables → 🥬, fruits → 🍎, seafood → 🐟, etc.) to add visual interest
7. **Fix card clipping**: Ensure gradient overlays don't clip content text

### `src/components/landing/WhySection.tsx`
8. No major issues — design is clean. Keep as-is.

### `src/components/landing/TopNav.tsx`
9. **Add SheetTitle** for accessibility compliance in mobile nav

### `src/components/landing/LandingFooter.tsx`
10. No issues found — layout and responsiveness are good.

### `src/pages/Index.tsx` (Dashboard)
11. Dashboard layout is clean on both desktop and mobile. No changes needed.

### `src/pages/News.tsx`
12. News page layout is functional. No changes needed.

## Files Changed

| File | Changes |
|------|---------|
| `src/components/landing/HeroSection.tsx` | Responsive mockup sizing, stat bar fixes, font weight |
| `src/components/landing/ItemGrid.tsx` | Food emoji on cards |
| `src/components/landing/TopNav.tsx` | Accessibility fix for mobile Sheet |

