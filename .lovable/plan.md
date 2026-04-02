
# Fix White Border on Phone Mockup

## Problem
The phone frame uses `border-gray-900` which isn't pure black, creating a visible lighter edge. Additionally, the container has no background color, so any sub-pixel gap between the video and border shows white.

## Fix — `src/components/landing/HeroSection.tsx` (line 80)

Change the phone container classes:
- `border-gray-900` → `border-black` (pure black border)
- Add `bg-black` (fill any sub-pixel gaps with black instead of white)

```tsx
// Before
<div className="relative mx-auto h-[520px] w-[260px] overflow-hidden rounded-[2.5rem] border-[7px] border-gray-900 shadow-2xl md:h-[580px] md:w-[290px]">

// After
<div className="relative mx-auto h-[520px] w-[260px] overflow-hidden rounded-[2.5rem] border-[7px] border-black bg-black shadow-2xl md:h-[580px] md:w-[290px]">
```

One line changed, one file.
